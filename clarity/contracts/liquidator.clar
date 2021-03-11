;; errors
(define-constant err-liquidation-failed u1)

;; TODO: only callable by a registered stacker
(define-public (notify-risky-reserve (vault-id uint))
  (let ((collateral-to-debt-ratio (unwrap-panic (contract-call? .stx-reserve calculate-current-collateral-to-debt-ratio vault-id))))
    (let ((liquidation-ratio (unwrap-panic (contract-call? .stx-reserve get-liquidation-ratio))))
      (if (>= collateral-to-debt-ratio liquidation-ratio)
        (begin
          (print "Vault is in danger. Time to liquidate.")
          (let ((stx-collateral (unwrap-panic (as-contract (contract-call? .stx-reserve liquidate vault-id)))))
            (if (unwrap-panic (start-auction stx-collateral))
              (ok true)
              (err err-liquidation-failed)
            )
          )
        )
        (ok true) ;; false alarm - vault is not at risk. just return successful response
      )
    )
  )
)

(define-private (start-auction (stx-collateral uint))
  (ok true)
)
