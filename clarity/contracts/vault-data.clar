;; Contains all state for freddie the vault manager

;; ---------------------------------------------------------
;; Variables
;; ---------------------------------------------------------

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
  stability-fee: uint,
  stability-fee-last-accrued: uint, ;; indicates the block height at which the stability fee was last accrued (calculated)
  is-liquidated: bool,
  auction-ended: bool,
  leftover-collateral: uint
})
(define-map vault-entries { user: principal } { ids: (list 1200 uint) })
(define-map closing-vault
  { user: principal }
  { vault-id: uint }
)
(define-data-var last-vault-id uint u0)
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED u7401)

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
      stability-fee: u0,
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

(define-public (update-vault (vault-id uint) (data (tuple (id uint) (owner principal) (collateral uint) (collateral-type (string-ascii 12)) (collateral-token (string-ascii 12)) (stacked-tokens uint) (revoked-stacking bool) (debt uint) (created-at-block-height uint) (updated-at-block-height uint) (stability-fee uint) (stability-fee-last-accrued uint) (is-liquidated bool) (auction-ended bool) (leftover-collateral uint))))
  (let ((vault (get-vault-by-id vault-id)))
    (asserts! (is-eq contract-caller (unwrap-panic (contract-call? .dao get-qualified-name-by-name "freddie"))) (err ERR-NOT-AUTHORIZED))
  
    (map-set vaults (tuple (id vault-id)) data)
    (ok true)
  )
)

(define-public (update-vault-entries (user principal) (vault-id uint))
  (let ((entries (get ids (get-vault-entries user))))
    (asserts! (is-eq contract-caller (unwrap-panic (contract-call? .dao get-qualified-name-by-name "freddie"))) (err ERR-NOT-AUTHORIZED))

    (map-set vault-entries { user: user } { ids: (unwrap-panic (as-max-len? (append entries vault-id) u1200)) })
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