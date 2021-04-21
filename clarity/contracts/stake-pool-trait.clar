;; implements a trait that allows collateral of any token (e.g. stx, bitcoin)
(use-trait mock-ft-trait .mock-ft-trait.mock-ft-trait)

(define-trait stake-pool-trait
  (

    ;; Stake asset
    (stake (<mock-ft-trait> uint) (response uint uint))

    ;; Unstake asset
    (unstake (<mock-ft-trait> uint) (response uint uint))

    ;; Get pending rewards for staker
    ;; (get-pending-rewards-for (principal) (response uint uint))

    ;; TODO: Claim rewards


    ;; TODO: stake pending rewards in diko pool? V2?

  )
)
