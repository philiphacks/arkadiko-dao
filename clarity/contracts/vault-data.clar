;; Contains all state for freddie the vault manager

;; ---------------------------------------------------------
;; Variables
;; ---------------------------------------------------------

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED u7401)
(define-constant ERR-REWARDS-CALC u7001)

;; Map of vault entries
;; The entry consists of a user principal with their collateral and debt balance
(define-map vaults { id: uint } {
  id: uint,
  owner: principal,
  collateral: uint,
  collateral-type: (string-ascii 12), ;; e.g. STX-A, STX-B, BTC-A etc (represents the collateral class)
  collateral-token: (string-ascii 12), ;; e.g. STX, BTC etc (represents the symbol of the collateral)
  stacked-tokens: uint,
  revoked-stacking: bool,
  debt: uint,
  created-at-block-height: uint,
  updated-at-block-height: uint,
  stability-fee-last-accrued: uint, ;; indicates the block height at which the stability fee was last accrued (calculated)
  is-liquidated: bool,
  auction-ended: bool,
  leftover-collateral: uint
})
(define-map vault-entries 
  { user: principal } 
  { 
    ids: (list 1200 uint)
  }
)
(define-map closing-vault
  { user: principal }
  { vault-id: uint }
)
(define-map stacking-payout
  { vault-id: uint }
  {
    collateral-amount: uint,
    principals: (list 500 (tuple (collateral-amount uint) (recipient principal)))
  }
)
(define-data-var last-vault-id uint u0)

;; To keep track of rewards
(define-data-var total-collateral uint u0) 
(define-data-var cumm-reward-per-collateral uint u0) 
(define-data-var last-reward-increase-block uint u0) 

;; Keep track of cumm rewards per collateral for user
(define-map reward-per-collateral 
   { user: principal } 
   {
      cumm-reward-per-collateral: uint
   }
)

;; ---------------------------------------------------------
;; Getters
;; ---------------------------------------------------------

(define-read-only (get-vault-by-id (id uint))
  (default-to
    {
      id: u0,
      owner: CONTRACT-OWNER,
      collateral: u0,
      collateral-type: "",
      collateral-token: "",
      stacked-tokens: u0,
      revoked-stacking: false,
      debt: u0,
      created-at-block-height: u0,
      updated-at-block-height: u0,
      stability-fee-last-accrued: u0,
      is-liquidated: false,
      auction-ended: false,
      leftover-collateral: u0
    }
    (map-get? vaults { id: id })
  )
)

(define-read-only (get-vault-entries (user principal))
  (unwrap! (map-get? vault-entries { user: user }) (tuple (ids (list u0) )))
)

(define-read-only (get-last-vault-id)
  (var-get last-vault-id)
)

(define-read-only (get-stacking-payout (vault-id uint))
  (default-to
    { collateral-amount: u0, principals: (list) }
    (map-get? stacking-payout { vault-id: vault-id })
  )
)

(define-public (set-last-vault-id (vault-id uint))
  (begin
    (asserts! (is-eq contract-caller (unwrap-panic (contract-call? .dao get-qualified-name-by-name "freddie"))) (err ERR-NOT-AUTHORIZED))

    (ok (var-set last-vault-id vault-id))
  )
)

(define-read-only (get-vaults (user principal))
  (let ((entries (get ids (get-vault-entries user))))
    (ok (map get-vault-by-id entries))
  )
)

(define-public (update-vault (vault-id uint) (data (tuple (id uint) (owner principal) (collateral uint) (collateral-type (string-ascii 12)) (collateral-token (string-ascii 12)) (stacked-tokens uint) (revoked-stacking bool) (debt uint) (created-at-block-height uint) (updated-at-block-height uint) (stability-fee-last-accrued uint) (is-liquidated bool) (auction-ended bool) (leftover-collateral uint))))
  (let (
    (vault (get-vault-by-id vault-id))
    (current-collateral (get collateral vault))
    (new-collateral (get collateral data))
    (current-total-collateral (var-get total-collateral))
    (vault-owner (get owner data))
  )
    (asserts!
      (or
        (is-eq contract-caller (unwrap-panic (contract-call? .dao get-qualified-name-by-name "freddie")))
        (is-eq contract-caller (unwrap-panic (contract-call? .dao get-qualified-name-by-name "stacker")))
      )
      (err ERR-NOT-AUTHORIZED)
    )  

    ;; Save latest cumm reward
    (increase-cumm-reward-per-collateral)
    ;; Save vault changes
    (map-set vaults (tuple (id vault-id)) data)
    ;; Update total
    (var-set total-collateral (- (+ current-total-collateral new-collateral) current-collateral))
    ;; Save cumm reward again, as total changed
    (increase-cumm-reward-per-collateral)
    ;; Save for user
    (map-set reward-per-collateral { user: vault-owner } { cumm-reward-per-collateral: (var-get cumm-reward-per-collateral) })

    (ok true)
  )
)

(define-public (update-vault-entries (user principal) (vault-id uint))
  (let (
    (entries (get ids (get-vault-entries user)))
    (vault (get-vault-by-id vault-id))
  )
    (asserts! (is-eq contract-caller (unwrap-panic (contract-call? .dao get-qualified-name-by-name "freddie"))) (err ERR-NOT-AUTHORIZED))

    ;; Save latest cumm reward
    (increase-cumm-reward-per-collateral)
    ;; Add vault for user
    (map-set vault-entries { user: user } { ids: (unwrap-panic (as-max-len? (append entries vault-id) u1200)) })
    ;; Update total
    (var-set total-collateral (+ (var-get total-collateral) (get collateral vault)))
    ;; Save cumm reward again, as total changed
    (increase-cumm-reward-per-collateral)
    ;; Save for user
    (map-set reward-per-collateral { user: user } { cumm-reward-per-collateral: (var-get cumm-reward-per-collateral) })

    (ok true)
  )
)

(define-private (remove-burned-vault (vault-id uint))
  (let ((current-vault (unwrap-panic (map-get? closing-vault { user: tx-sender }))))
    (if (is-eq vault-id (get vault-id current-vault))
      false
      true
    )
  )
)

(define-public (close-vault (vault-id uint))
  (let (
    (vault (get-vault-by-id vault-id))
    (entries (get ids (get-vault-entries (get owner vault))))
  )
    (asserts! (is-eq contract-caller (unwrap-panic (contract-call? .dao get-qualified-name-by-name "freddie"))) (err ERR-NOT-AUTHORIZED))

    (map-set closing-vault { user: (get owner vault) } { vault-id: vault-id })
    (if (map-set vault-entries { user: tx-sender } { ids: (filter remove-burned-vault entries) })
      (ok (map-delete vaults { id: vault-id }))
      (err u0)
    )
  )
)

;; called on liquidation
;; when a vault gets liquidated, the vault owner is no longer eligible for the yield
(define-public (reset-stacking-payouts (vault-id uint))
  (begin
    (asserts! (is-eq contract-caller (unwrap-panic (contract-call? .dao get-qualified-name-by-name "freddie"))) (err ERR-NOT-AUTHORIZED))

    (map-set stacking-payout
      { vault-id: vault-id }
      ;;{ principals: (list (tuple (percentage-basis-points u0) (recipient CONTRACT-OWNER))) }
      { collateral-amount: u0, principals: (list) }
    )

    (ok true)
  )
)

(define-public (add-stacker-payout (vault-id uint) (collateral-amount uint) (recipient principal))
  (let (
    (stacking-payout-entry (get-stacking-payout vault-id))
    (principals (get principals stacking-payout-entry))
  )
    (asserts!
      (or
        (is-eq contract-caller (unwrap-panic (contract-call? .dao get-qualified-name-by-name "freddie")))
        (is-eq contract-caller (unwrap-panic (contract-call? .dao get-qualified-name-by-name "auction-engine")))
      )
      (err ERR-NOT-AUTHORIZED)
    )

    (map-set stacking-payout
      { vault-id: vault-id }
      {
        collateral-amount: (+ collateral-amount (get collateral-amount stacking-payout-entry)),
        principals: (unwrap-panic (as-max-len? (append principals (tuple (collateral-amount collateral-amount) (recipient recipient))) u500))
      }
    )
    (ok true)
  )
)

;; ---------------------------------------------------------
;; Vault rewards
;; ---------------------------------------------------------

;; Helper to get collateral from a vault
(define-read-only (get-collateral-of-vault-by-id (id uint))
  (get collateral (get-vault-by-id id))
)

;; Get total collateral
(define-read-only (get-total-collateral-of (user principal))
  (let (
    (vault-ids (get ids (get-vault-entries user)))
    (vaults-collateral (map get-collateral-of-vault-by-id vault-ids))
    (total-collateral-user (fold + vaults-collateral u0))
  )
    total-collateral-user
  )
)

;; Get collateral info - last rewards block
(define-read-only (get-cumm-reward-per-collateral-of (user principal))
  (get cumm-reward-per-collateral 
    (default-to
      { cumm-reward-per-collateral: u0 }
      (map-get? reward-per-collateral { user: user })
    )
  )
)

;; Get pending rewards for user
(define-read-only (get-pending-rewards (user principal))
  (let (
    (collateral-amount (get-total-collateral-of user))
    (amount-owed-per-token (- (calculate-cumm-reward-per-collateral) (get-cumm-reward-per-collateral-of user)))
    (rewards-decimals (* collateral-amount amount-owed-per-token))
    (rewards (/ rewards-decimals u1000000))
  )
    (ok rewards)
  )
)

;; Claim rewards for user
(define-public (claim-pending-rewards (user principal))
  (begin
    ;; TODO
    ;; (asserts! (is-eq contract-caller (unwrap-panic (contract-call? .dao get-qualified-name-by-name "freddie"))) (err ERR-NOT-AUTHORIZED))
    (increase-cumm-reward-per-collateral)

    (let (
      (pending-rewards (unwrap! (get-pending-rewards user) (err ERR-REWARDS-CALC)))
    )
      ;; Only mint if enough pending rewards and amount is positive
      (if (>= pending-rewards u1)
        (begin
          ;; Mint DIKO rewards for user
          ;; TODO: mint via DAO
          ;; (try! (contract-call? .stake-registry mint-rewards-for-staker pending-rewards staker))

          (map-set reward-per-collateral { user: user } { cumm-reward-per-collateral: (var-get cumm-reward-per-collateral) })

          (ok pending-rewards)
        )
        (ok u0)
      )
    )
  )
)

;; Increase cumm reward per collateral and save
(define-private (increase-cumm-reward-per-collateral)
  (let (
    ;; Calculate new cumm reward per collateral
    (new-cumm-reward-per-collateral (calculate-cumm-reward-per-collateral))
  )
    (var-set cumm-reward-per-collateral new-cumm-reward-per-collateral)
    (var-set last-reward-increase-block block-height)
    new-cumm-reward-per-collateral
  )
)

;; Calculate current cumm reward per collateral
(define-read-only (calculate-cumm-reward-per-collateral)
  (let (
    ;; (rewards-per-block (contract-call? .diko-guardian get-rewards-per-block-for-pool .stake-pool-diko))
    (rewards-per-block u100) ;; TODO: get from diko-guardian (merge branch first)
    (current-total-collateral (var-get total-collateral))
    (block-diff (- block-height (var-get last-reward-increase-block)))
    (current-cumm-reward-per-collateral (var-get cumm-reward-per-collateral)) 
  )
    (if (> current-total-collateral u0)
      (let (
        (total-rewards-to-distribute (* rewards-per-block block-diff))
        (reward-added-per-token (/ (* total-rewards-to-distribute u1000000) current-total-collateral))
        (new-cumm-reward-per-collateral (+ current-cumm-reward-per-collateral reward-added-per-token))
      )
        new-cumm-reward-per-collateral
      )
      current-cumm-reward-per-collateral
    )
  )
)

;; Initialize the contract
(begin
  (var-set last-reward-increase-block block-height)
)
