;; Stake Pool - Stake DIKO to get sDIKO
;; 
;; A fixed amount of rewards per block will be distributed across all stakers, according to their size in the pool
;; Rewards will be automatically staked before staking or unstaking. 
;; 
;; The cumm reward per stake represents the rewards over time, taking into account total staking volume over time
;; When total stake changes, the cumm reward per stake is increased accordingly.

(impl-trait .stake-pool-trait.stake-pool-trait)
(impl-trait .mock-ft-trait.mock-ft-trait)
(use-trait mock-ft-trait .mock-ft-trait.mock-ft-trait)

;; Errors
(define-constant ERR-NOT-AUTHORIZED (err u18401))
(define-constant ERR-REWARDS-CALC (err u18001))
(define-constant ERR-WRONG-TOKEN (err u18002))

;; Constants
(define-constant CONTRACT-OWNER tx-sender) ;; TODO: should be DAO
(define-constant POOL-TOKEN .arkadiko-token)
(define-constant REWARDS-PER-BLOCK u1000000000) ;; TODO: set production value. Test value is 1000 DIKO per block with 6 decimals
(define-constant BLOCKS-PER-YEAR u52560)

;; Variables
(define-data-var token-uri (string-utf8 256) u"")
(define-data-var total-staked uint u0)
(define-data-var cumm-reward-per-stake uint u0)
(define-data-var last-reward-increase-block uint u0) 


;; ---------------------------------------------------------
;; SIP-10 Functions
;; ---------------------------------------------------------

(define-fungible-token stdiko)

(define-read-only (get-total-supply)
  (ok (ft-get-supply stdiko))
)

(define-read-only (get-name)
  (ok "Staked DIKO")
)

(define-read-only (get-symbol)
  (ok "stDIKO")
)

(define-read-only (get-decimals)
  (ok u6)
)

(define-read-only (get-balance-of (account principal))
  (ok (ft-get-balance stdiko account))
)

(define-public (set-token-uri (value (string-utf8 256)))
  (if (is-eq tx-sender CONTRACT-OWNER) ;; TODO: should become DAO??
    (ok (var-set token-uri value))
    (err ERR-NOT-AUTHORIZED)
  )
)

(define-read-only (get-token-uri)
  (ok (some (var-get token-uri)))
)

(define-public (transfer (amount uint) (sender principal) (recipient principal))
  (ft-transfer? stdiko amount sender recipient)
)


;; ---------------------------------------------------------
;; Stake Functions
;; ---------------------------------------------------------

;; Keep track of total amount staked and last cumm reward per stake
(define-map stakes 
   { staker: principal } 
   {
      uamount: uint,  ;; micro diko amount staked
      cumm-reward-per-stake: uint
   }
)

(define-read-only (get-stake-of (staker principal))
  (default-to
    { uamount: u0, cumm-reward-per-stake: u0 }
    (map-get? stakes { staker: staker })
  )
)

;; Get stake info - amount staked
(define-read-only (get-stake-amount-of (staker principal))
  (get uamount (get-stake-of staker))
)

;; Get stake info - last rewards block
(define-read-only (get-stake-cumm-reward-per-stake-of (staker principal))
  (get cumm-reward-per-stake (get-stake-of staker))
)

;; Get variable total-staked
(define-read-only (get-total-staked)
  (var-get total-staked)
)

;; Get variable cumm-reward-per-stake
(define-read-only (get-cumm-reward-per-stake)
  (var-get cumm-reward-per-stake)
)

;; Get variable last-reward-increase-block
(define-read-only (get-last-reward-increase-block)
  (var-get last-reward-increase-block)
)

;; Stake tokens
(define-public (stake (token <mock-ft-trait>) (staker principal) (amount uint))
  (begin
    (asserts! (is-eq contract-caller (unwrap-panic (contract-call? .dao get-qualified-name-by-name "stake-registry"))) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq POOL-TOKEN (contract-of token)) ERR-WRONG-TOKEN)

    ;; Save currrent cumm reward per stake
    (increase-cumm-reward-per-stake)

    (let (
      ;; Calculate new stake amount
      (stake-amount (get-stake-amount-of staker))
      (new-stake-amount (+ stake-amount amount))
    )
      ;; Claim all pending rewards for staker so we can set the new cumm-reward for this user
      (try! (claim-pending-rewards staker))

      ;; Update total stake
      (var-set total-staked (+ (var-get total-staked) amount))

      ;; Update cumm reward per stake now that total is updated
      (increase-cumm-reward-per-stake)

      ;; Mint stDIKO
      (try! (ft-mint? stdiko amount staker))

      ;; Transfer DIKO to this contract
      (try! (contract-call? .arkadiko-token transfer amount staker (as-contract tx-sender)))

      ;; Update sender stake info
      (map-set stakes { staker: staker } { uamount: new-stake-amount, cumm-reward-per-stake: (var-get cumm-reward-per-stake) })

      (ok new-stake-amount)
    )
  )

)

;; Unstake tokens
(define-public (unstake (token <mock-ft-trait>) (staker principal) (amount uint))
  (begin
    (asserts! (is-eq contract-caller (unwrap-panic (contract-call? .dao get-qualified-name-by-name "stake-registry"))) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq POOL-TOKEN (contract-of token)) ERR-WRONG-TOKEN)

    ;; Save currrent cumm reward per stake
    (increase-cumm-reward-per-stake)

    (let (
      ;; Calculate new stake amount
      (stake-amount (get-stake-amount-of staker))
      (new-stake-amount (- stake-amount amount))
    )
      ;; Claim all pending rewards for staker so we can set the new cumm-reward for this user
      (try! (claim-pending-rewards staker))

      ;; Update total stake
      (var-set total-staked (- (var-get total-staked) amount))

      ;; Update cumm reward per stake now that total is updated
      (increase-cumm-reward-per-stake)

      ;; Burn stDIKO 
      (try! (ft-burn? stdiko amount staker))

      ;; Transfer DIKO back from this contract to the user
      (try! (contract-call? .arkadiko-token transfer amount (as-contract tx-sender) staker))

      ;; Update sender stake info
      (map-set stakes { staker: staker } { uamount: new-stake-amount, cumm-reward-per-stake: (var-get cumm-reward-per-stake) })

      (ok new-stake-amount)
    )
  )
)

(define-read-only (get-apy-for (staker principal))
  (let (
    (diko-staked (get-stake-amount-of staker))
    (reward-percentage (/ (var-get total-staked) diko-staked))
    (diko-per-year (/ (* REWARDS-PER-BLOCK reward-percentage) u1000000))
  )
    (* (/ diko-per-year diko-staked) u100)
  )
)

;; Get pending rewards for staker
(define-read-only (get-pending-rewards (staker principal))
  (let (
    (stake-amount (get-stake-amount-of staker))
    (amount-owed-per-token (- (calculate-cumm-reward-per-stake) (get-stake-cumm-reward-per-stake-of staker)))
    (rewards-decimals (* stake-amount amount-owed-per-token))
    (rewards (/ rewards-decimals u1000000))
  )
    (ok rewards)
  )
)

;; Claim rewards for staker
(define-public (claim-pending-rewards (staker principal))
  (begin
    (asserts! (is-eq contract-caller (unwrap-panic (contract-call? .dao get-qualified-name-by-name "stake-registry"))) ERR-NOT-AUTHORIZED)
    (increase-cumm-reward-per-stake)

    (let (
      (pending-rewards (unwrap! (get-pending-rewards staker) ERR-REWARDS-CALC))
      (stake-of (get-stake-of staker))
    )
      ;; Only mint if enough pending rewards and amount is positive
      (if (>= pending-rewards u1)
        (begin
          ;; Mint DIKO rewards for staker
          (try! (contract-call? .dao mint-token .arkadiko-token pending-rewards staker))
          (map-set stakes { staker: staker } (merge stake-of { cumm-reward-per-stake: (var-get cumm-reward-per-stake) }))

          (ok pending-rewards)
        )
        (ok u0)
      )
    )
  )
)


;; Increase cumm reward per stake and save
(define-private (increase-cumm-reward-per-stake)
  (let (
    ;; Calculate new cumm reward per stake
    (new-cumm-reward-per-stake (calculate-cumm-reward-per-stake))
    (last-block-height (get-last-block-height))
  )
    (var-set cumm-reward-per-stake new-cumm-reward-per-stake)
    (var-set last-reward-increase-block last-block-height)
    new-cumm-reward-per-stake
  )
)

;; Calculate current cumm reward per stake
(define-read-only (calculate-cumm-reward-per-stake)
  (let (
    (current-total-staked (var-get total-staked))
    (last-block-height (get-last-block-height))
    (block-diff (- last-block-height (var-get last-reward-increase-block)))
    (current-cumm-reward-per-stake (var-get cumm-reward-per-stake)) 
  )
    (if (> current-total-staked u0)
      (let (
        (total-rewards-to-distribute (* REWARDS-PER-BLOCK block-diff))
        (reward-added-per-token (/ (* total-rewards-to-distribute u1000000) current-total-staked))
        (new-cumm-reward-per-stake (+ current-cumm-reward-per-stake reward-added-per-token))
      )
        new-cumm-reward-per-stake
      )
      current-cumm-reward-per-stake
    )
  )
)

;; Helper for current-cumm-reward-per-stake
;; Return current block height, or block height when pool was deactivated
(define-private (get-last-block-height)
  (let (
    ;; TODO: stake-registry should be dynamic
    (pool-data (contract-call? .stake-registry get-pool-data .stake-pool-diko))
    (pool-active (get active pool-data))
    (deactivated-block (get deactivated-block pool-data))
  )
    (if (is-eq pool-active true)
      block-height
      deactivated-block
    )
  )
)

;; Initialize the contract
(begin
  (var-set last-reward-increase-block block-height)
)