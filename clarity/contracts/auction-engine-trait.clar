(use-trait oracle-trait .oracle-trait.oracle-trait)
(use-trait vault-manager-trait .vault-manager-trait.vault-manager-trait)

(define-trait auction-engine-trait
  (
    (fetch-minimum-collateral-amount (<oracle-trait> uint) (response uint bool))
    (start-auction (<vault-manager-trait> uint uint uint) (response bool uint))
  )
)
