(define-constant stx-reserve-address 'S02J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKPVKG2CE)

(define-data-var stability-fee uint u1)
(define-data-var liquidation-ratio uint u150)
(define-data-var maximum-debt uint u100000000)
(define-data-var liquidation-penalty uint u13)
(define-constant err-transfer-failed u49)
(define-constant err-minter-failed u50)
(define-constant token-minter (as-contract tx-sender))

;; Map of reserve entries
;; The entry consists of username and a public url
;;(define-map reserve ((reserve-id uint)) ((name (buff 30)) (balance uint)))
(define-map reserve { user: principal } { balance: uint })

;; stx-amount * current-stx-price == dollar-collateral-posted
;; 100 * (dollar-collateral-posted / liquidation-ratio) == stablecoins to mint 
(define-read-only (arkadiko-count (stx-amount uint))
  (let ((current-stx-price (contract-call? .oracle get-price)))
    (let ((amount (* u100 (/ (* stx-amount (get price current-stx-price)) (var-get liquidation-ratio)))))
      (begin
        (print amount)
        (print current-stx-price)
        (print (var-get liquidation-ratio))
        { amount: amount }
      )
    )
  )
)

(define-public (collateralize-and-mint (stx-amount uint) (sender principal))
  (let ((tx-output (stx-transfer? stx-amount sender stx-reserve-address)))
    (if (is-ok tx-output)
      (begin
        (let ((coins (arkadiko-count stx-amount)))
          (if (is-ok (contract-call? .arkadiko-token mint token-minter (get amount coins)))
            (begin
              (map-insert reserve { user: sender } { balance: stx-amount })
              (ok stx-amount)
            )
            (err err-minter-failed)
          )
        )
      )
      (err err-transfer-failed)
    )
  )
)
