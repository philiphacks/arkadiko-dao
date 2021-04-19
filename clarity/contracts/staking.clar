(use-trait mock-ft-trait .mock-ft-trait.mock-ft-trait)

;; Staking contract - Stake DIKO to get sDIKO
;; 
;; A fixed amount of rewards per block will be distributed across all stakers, according to their size in the pool
;; Rewards will be automatically staked before staking or unstaking. 
;; 
;; The cumm reward per stake represents the rewards over time, taking into account total staking volume over time
;; When total stake changes, the cumm reward per stake is increased accordingly.

;; errors

(define-constant ERR-NOT-AUTHORIZED u16401)

;; Variables
(define-data-var total-staked uint u0)
(define-data-var cumm-reward-per-stake uint u0)
(define-data-var last-reward-increase-block uint u0) 

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
(define-public (stake (amount uint))
  (let (
    ;; Pending rewards will be staked first
    ;; The cumm reward per stake for the user will be updates,
    ;; so new rewards only start from this block
    (stake-pending-result (stake-pending-rewards-of tx-sender)) 

    ;; Calculate new stake amount
    (stake-amount (get-stake-amount-of tx-sender))
    (new-stake-amount (+ stake-amount amount))
  )
    ;; Mint stDIKO or LP token
    (try! (contract-call? .stdiko-token mint amount tx-sender))
    (try! (contract-call? .arkadiko-token burn amount tx-sender))
    ;; Increase cumm reward for new total staked
    (try! (increase-cumm-reward-per-stake))

    ;; Update total stake
    (var-set total-staked (+ (var-get total-staked) amount))
    ;; Update sender stake info
    (map-set stakes { staker: tx-sender } { uamount: new-stake-amount, cumm-reward-per-stake: (var-get cumm-reward-per-stake) })

    (ok new-stake-amount)
  )
)

;; Unstake tokens
(define-public (unstake (amount uint))
  (let (
    ;; Pending rewards will be staked first
    (stake-pending-result (stake-pending-rewards-of tx-sender)) 
    ;; Calculate new stake amount
    (stake-amount (get-stake-amount-of tx-sender))
    (new-stake-amount (- stake-amount amount))
  )
    ;; Update total stake
    (var-set total-staked (- (var-get total-staked) amount))

    (try! (contract-call? .arkadiko-token mint amount tx-sender))
    (try! (contract-call? .stdiko-token burn amount tx-sender))
    ;; Increase cumm reward for new total staked
    (try! (increase-cumm-reward-per-stake))

    ;; Update sender stake info
    (map-set stakes { staker: tx-sender } { uamount: new-stake-amount, cumm-reward-per-stake: (var-get cumm-reward-per-stake) })
    (ok new-stake-amount)
  )
)

;; Get amount of rewards which are not staked yet
(define-read-only (get-pending-rewards-for (staker principal))
  (let (
    (stake-amount (get-stake-amount-of staker))
    (amount-owed-per-token (- (var-get cumm-reward-per-stake) (get-stake-cumm-reward-per-stake-of staker)))
    (rewards (* stake-amount amount-owed-per-token))
  )
    rewards
  )
)

;; Stake pending reward for a given staker
(define-public (stake-pending-rewards-of (staker principal))
  (let (
    (pending-rewards (get-pending-rewards-for staker))
    (stake-amount (get-stake-amount-of staker))
    (new-stake-amount (+ pending-rewards stake-amount))
  )
    ;; Update total stake
    (var-set total-staked (+ (var-get total-staked) pending-rewards))    
    ;; Increase cumm reward for new total staked
    (try! (increase-cumm-reward-per-stake))
    ;; Mint sDIKO
    (try! (contract-call? .stdiko-token mint pending-rewards staker))
    ;; Update sender stake info
    (map-set stakes { staker: staker } { uamount: new-stake-amount, cumm-reward-per-stake: (var-get cumm-reward-per-stake) })

    (ok new-stake-amount)
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
