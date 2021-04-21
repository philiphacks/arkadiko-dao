(use-trait vault-manager-trait .vault-manager-trait.vault-manager-trait)

(define-trait auction-engine-trait
  (
    (start-auction (<vault-manager-trait> uint uint uint) (response bool uint))
  )
)
