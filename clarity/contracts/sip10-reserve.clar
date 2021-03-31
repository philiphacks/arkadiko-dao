;; (impl-trait .vault-trait.vault-trait)
(use-trait mock-ft-trait 'SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.mock-ft-trait.mock-ft-trait)

;; errors
(define-constant err-unauthorized u1)

(define-read-only (calculate-xusd-count (token (string-ascii 12)) (ucollateral-amount uint) (collateral-type (string-ascii 12)))
  (let ((price-in-cents (contract-call? 'SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.oracle get-price token)))
    (let ((amount
      (/
        (* ucollateral-amount (get last-price-in-cents price-in-cents))
        (unwrap-panic (contract-call? 'SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.dao get-collateral-to-debt-ratio collateral-type))
      )))
      (ok amount)
    )
  )
)

(define-read-only (calculate-current-collateral-to-debt-ratio (token (string-ascii 12)) (debt uint) (ucollateral uint))
  (let ((price-in-cents (contract-call? 'SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.oracle get-price token)))
    (if (> debt u0)
      (ok (/ (* ucollateral (get last-price-in-cents price-in-cents)) debt))
      (err u0)
    )
  )
)

(define-public (collateralize-and-mint (token (string-ascii 12)) (ucollateral-amount uint) (debt uint) (sender principal))
  (begin
    (asserts! (is-eq contract-caller .freddie) (err err-unauthorized))

    ;; (match (print (ft-transfer? token ucollateral-amount sender (as-contract tx-sender)))
    (match (contract-call? (as-contract token) transfer )
      success (ok debt)
      error (err err-transfer-failed)
    )
  )
)

;; (define-public (deposit (token (string-ascii 12)) (additional-ucollateral-amount uint))
;;   (begin
;;     (asserts! (is-eq contract-caller .freddie) (err err-unauthorized))

;;     (match (print (ft-transfer? token additional-ucollateral-amount tx-sender (as-contract tx-sender)))
;;       success (ok true)
;;       error (err err-deposit-failed)
;;     )
;;   )
;; )

;; (define-public (withdraw (token (string-ascii 12)) (vault-owner principal) (ucollateral-amount uint))
;;   (begin
;;     (asserts! (is-eq contract-caller .freddie) (err err-unauthorized))

;;     (match (print (as-contract (ft-transfer? token ucollateral-amount (as-contract tx-sender) vault-owner)))
;;       success (ok true)
;;       error (err err-withdraw-failed)
;;     )
;;   )
;; )

;; (define-public (mint (token (string-ascii 12)) (vault-owner principal) (ucollateral-amount uint) (current-debt uint) (extra-debt uint))
;;   (begin
;;     (asserts! (is-eq contract-caller .freddie) (err err-unauthorized))

;;     (let ((max-new-debt (- (unwrap-panic (calculate-xusd-count token ucollateral-amount)) current-debt)))
;;       (if (>= max-new-debt extra-debt)
;;         (match (print (as-contract (contract-call? 'SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.xusd-token mint extra-debt vault-owner)))
;;           success (ok true)
;;           error (err err-mint-failed)
;;         )
;;         (err err-mint-failed)
;;       )
;;     )
;;   )
;; )

;; (define-public (burn (token (string-ascii 12)) (vault-owner principal) (collateral-to-return uint))
;;   (begin
;;     (asserts! (is-eq contract-caller .freddie) (err err-unauthorized))

;;     (match (print (as-contract (ft-transfer? token collateral-to-return (as-contract tx-sender) vault-owner)))
;;       transferred (ok true)
;;       error (err err-transfer-failed)
;;     )
;;   )
;; )

;; (define-public (redeem-collateral (token (string-ascii 12)) (ucollateral uint) (owner principal))
;;   (begin
;;     (asserts! (is-eq contract-caller .auction-engine) (err err-unauthorized))
;;     (as-contract (ft-transfer? token ucollateral (as-contract tx-sender) owner))
;;   )
;; )
