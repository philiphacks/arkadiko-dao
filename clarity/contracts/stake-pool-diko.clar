;; Staking contract - Stake DIKO to get sDIKO
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

;; Constants
(define-constant CONTRACT-OWNER tx-sender)

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
  (if (is-eq tx-sender CONTRACT-OWNER)
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
;; TODO: only DIKO tokens can be staked
;; TODO: only stake-registry should be able to call this method
(define-public (stake (token <mock-ft-trait>) (staker principal) (amount uint))
  (let (
    ;; Get pending rewards as we need to claim first
    (pending-rewards (unwrap! (get-pending-rewards staker) ERR-REWARDS-CALC))

    ;; Calculate new stake amount
    (stake-amount (get-stake-amount-of staker))
    (new-stake-amount (+ stake-amount amount))
  )
    ;; Claim all pending rewards for staker so we can set the new cumm-reward for this user
    (try! (claim-pending-rewards staker pending-rewards))

    ;; Update total stake
    (var-set total-staked (+ (var-get total-staked) amount))

    ;; Increase cumm reward for new total staked
    (try! (increase-cumm-reward-per-stake))

    ;; Mint stDIKO
    (try! (ft-mint? stdiko amount staker))

    ;; Transfer DIKO to this contract
    (try! (contract-call? token transfer amount staker (as-contract tx-sender)))

    ;; Update sender stake info
    (map-set stakes { staker: staker } { uamount: new-stake-amount, cumm-reward-per-stake: (var-get cumm-reward-per-stake) })

    (ok new-stake-amount)
  )
)

;; Unstake tokens
;; TODO: only stake-registry should be able to call this method
(define-public (unstake (token <mock-ft-trait>) (staker principal) (amount uint))
  (let (
    ;; Get pending rewards as we need to claim first
    (pending-rewards (unwrap! (get-pending-rewards staker) ERR-REWARDS-CALC))

    ;; Calculate new stake amount
    (stake-amount (get-stake-amount-of staker))
    (new-stake-amount (- stake-amount amount))
  )
    ;; Claim all pending rewards for staker so we can set the new cumm-reward for this user
    (try! (claim-pending-rewards staker pending-rewards))

    ;; Update total stake
    (var-set total-staked (- (var-get total-staked) amount))

    ;; Increase cumm reward for new total staked
    (try! (increase-cumm-reward-per-stake))

    ;; Burn stDIKO 
    (try! (ft-burn? stdiko amount staker))

    ;; Transfer DIKO back from this contract to the user
    (try! (contract-call? token transfer amount (as-contract tx-sender) staker))

    ;; Update sender stake info
    (map-set stakes { staker: staker } { uamount: new-stake-amount, cumm-reward-per-stake: (var-get cumm-reward-per-stake) })

    (ok new-stake-amount)
  )
)

;; Get pending rewards for staker
(define-read-only (get-pending-rewards (staker principal))
  (let (
    (stake-amount (get-stake-amount-of staker))
    (amount-owed-per-token (- (var-get cumm-reward-per-stake) (get-stake-cumm-reward-per-stake-of staker)))
    (rewards (* stake-amount amount-owed-per-token))
  )
    (ok rewards)
  )
)

;; Claim rewards for staker
;; TODO: only stake-registry should be able to call this method
(define-public (claim-pending-rewards (staker principal) (amount uint))
  (let (
    (pending-rewards (unwrap! (get-pending-rewards staker) ERR-REWARDS-CALC))
  )
    ;; Only mint if enough pending rewards and amount is positive
    (if (and (>= amount pending-rewards) (>= amount u1))
      (begin
        ;; Mint sDIKO for staker
      (try! (ft-mint? stdiko amount staker))

        (ok amount)
      )
      (ok u0)
    )
  )
)


;; Increase cumm reward per stake and save
(define-private (increase-cumm-reward-per-stake)
  (let (
    (current-total-staked (var-get total-staked))
    (rewards-per-block (unwrap-panic (contract-call? .dao get-staking-reward-per-block)))
    ;; Block difference
    (block-diff (- block-height (var-get last-reward-increase-block)))
    ;; Calculate new cumm reward per stake
    (new-cumm-reward-per-stake (calculate-cumm-reward-per-stake rewards-per-block block-diff current-total-staked))
  )
    (print current-total-staked)
    (var-set cumm-reward-per-stake new-cumm-reward-per-stake)
    (var-set last-reward-increase-block block-height)
    (if true
      (ok new-cumm-reward-per-stake)
      (err u0)
    )
  )
)

;; Calculate new cumm reward per stake (helper for increase-cumm-reward-per-stake)
(define-read-only (calculate-cumm-reward-per-stake (rewards-per-block uint) (block-diff uint) (current-total-staked uint))
  (let (
    (current-cumm-reward-per-stake (var-get cumm-reward-per-stake)) 
  )
    (if (> current-total-staked u0)
      (let (
        (total-rewards-to-distribute (* rewards-per-block block-diff))
        (reward-added-per-token (/ total-rewards-to-distribute current-total-staked))
        (new-cumm-reward-per-stake (+ current-cumm-reward-per-stake reward-added-per-token))
      )
        new-cumm-reward-per-stake
      )
      current-cumm-reward-per-stake
    )
  )
)
