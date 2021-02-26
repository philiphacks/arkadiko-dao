;; errors
(define-constant err-liquidation-failed u1)

;; only callable by a registered keeper
(define-public (notify-risky-reserve (vault-address principal))
  (let ((collateral-to-debt-ratio (contract-call? 'SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.stx-reserve calculate-current-collateral-to-debt-ratio vault-address)))
    (let ((liquidation-ratio (contract-call? 'SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.stx-reserve get-liquidation-ratio)))
      (if (> (get amount collateral-to-debt-ratio) (unwrap-panic liquidation-ratio))
        (begin
          (print "Vault is in danger. Time to liquidate.")
          (let ((stx-collateral (unwrap-panic (as-contract (contract-call? 'SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.stx-reserve liquidate vault-address)))))
            (if
              (and
                (is-some stx-collateral)
                (unwrap-panic (start-auction (unwrap-panic stx-collateral)))
              )
              (ok true)
              (err err-liquidation-failed)
            )
          )
        )
        (ok true)
      )
    )
  )
)

(define-private (start-auction (stx-collateral uint))
  (ok true)
)
