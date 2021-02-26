;; addresses
(define-constant stx-reserve-address 'S02J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKPVKG2CE)
(define-constant stx-liquidation-reserve 'S02J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKPVKG2CE)

;; errors
(define-constant err-unauthorized u1)
(define-constant err-transfer-failed u2)
(define-constant err-minter-failed u3)
(define-constant err-burn-failed u4)

;; risk parameters
(define-data-var liquidation-ratio uint u150)
(define-data-var collateral-to-debt-ratio uint u200)
(define-data-var maximum-debt uint u100000000)
(define-data-var liquidation-penalty uint u13)

;; Map of vault entries
;; The entry consists of a user principal with their STX balance collateralized
(define-map vaults { user: principal } { stx-collateral: uint, coins-minted: uint })

;; getters
(define-read-only (get-vault (user principal))
  (unwrap-panic (map-get? vaults { user: user }))
)

(define-read-only (get-liquidation-ratio)
  (ok (var-get liquidation-ratio))
)

;; setters accessible only by DAO contract
(define-public (set-liquidation-ratio (ratio uint))
  (if (is-eq contract-caller 'ST2ZRX0K27GW0SP3GJCEMHD95TQGJMKB7G9Y0X1MH.dao)
    (begin
      (var-set liquidation-ratio ratio)
      (ok (var-get liquidation-ratio))
    )
    (ok (var-get liquidation-ratio))
  )
)

(define-public (set-collateral-to-debt-ratio (ratio uint))
  (if (is-eq contract-caller 'ST2ZRX0K27GW0SP3GJCEMHD95TQGJMKB7G9Y0X1MH.dao)
    (begin
      (var-set collateral-to-debt-ratio ratio)
      (ok (var-get collateral-to-debt-ratio))
    )
    (ok (var-get collateral-to-debt-ratio))
  )
)

(define-public (set-maximum-debt (debt uint))
  (if (is-eq contract-caller 'ST2ZRX0K27GW0SP3GJCEMHD95TQGJMKB7G9Y0X1MH.dao)
    (begin
      (var-set maximum-debt debt)
      (ok (var-get maximum-debt))
    )
    (ok (var-get maximum-debt))
  )
)

(define-public (set-liquidation-penalty (penalty uint))
  (if (is-eq contract-caller 'ST2ZRX0K27GW0SP3GJCEMHD95TQGJMKB7G9Y0X1MH.dao)
    (begin
      (var-set liquidation-penalty penalty)
      (ok (var-get liquidation-penalty))
    )
    (ok (var-get liquidation-penalty))
  )
)

;; stx-amount * current-stx-price-in-cents == dollar-collateral-posted
;; (dollar-collateral-posted / liquidation-ratio) == stablecoins to mint
(define-read-only (calculate-arkadiko-count (stx-amount uint))
  (let ((current-stx-price (contract-call? 'SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.oracle get-price)))
    (let ((amount (/ (* stx-amount (get price current-stx-price)) (var-get collateral-to-debt-ratio))))
      (begin
        (print amount)
        (print current-stx-price)
        (print (var-get liquidation-ratio))
        (print (var-get collateral-to-debt-ratio))
        { amount: amount }
      )
    )
  )
)

(define-read-only (calculate-current-collateral-to-debt-ratio (user principal))
  (let ((current-stx-price (contract-call? 'SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.oracle get-price)))
    (let ((current-vault (get-vault user)))
      (begin
        {
          amount: (/
            (* (get stx-collateral (unwrap-panic (map-get? vaults { user: user }))) (get price current-stx-price))
            (get coins-minted (unwrap-panic (map-get? vaults { user: user })))
          )
        }
      )
    )
  )
)

;; accept collateral in STX tokens
;; save STX in stx-reserve-address
;; calculate price and collateralisation ratio
(define-public (collateralize-and-mint (stx-amount uint) (sender principal))
  (let ((coins (calculate-arkadiko-count stx-amount)))
    (match (print (stx-transfer? stx-amount sender stx-reserve-address))
      success (match (print (as-contract (contract-call? 'SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.arkadiko-token mint sender (get amount coins))))
        transferred (begin
          (print "minted tokens! inserting into map now.")
          (map-set vaults { user: sender } { stx-collateral: stx-amount, coins-minted: (get amount coins) })
          (ok (get amount coins))
        )
        error (err err-transfer-failed)
      )
      error (err err-minter-failed)
    )
  )
)

;; burn stablecoin to free up STX tokens
;; method assumes position has not been liquidated
;; and thus collateral to debt ratio > liquidation ratio
(define-public (burn (stablecoin-amount uint))
  (let ((vault (map-get? vaults { user: tx-sender })))
    (match (print (as-contract (contract-call? 'SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.arkadiko-token burn tx-sender (unwrap-panic (get coins-minted vault)))))
      success (match (stx-transfer? (unwrap-panic (get stx-collateral vault)) stx-reserve-address tx-sender)
        transferred (begin
          (map-delete vaults { user: tx-sender })
          (ok true)
        )
        error (err err-transfer-failed)
      )
      error (err err-burn-failed)
    )
  )
)

;; liquidate a vault-address' vault
;; should only be callable by the liquidator smart contract address
(define-public (liquidate (vault-address principal))
  (if (is-eq contract-caller 'ST2ZRX0K27GW0SP3GJCEMHD95TQGJMKB7G9Y0X1MH.liquidator)
    (begin
      (let ((vault (map-get? vaults { user: vault-address })))
        (match (print (as-contract (contract-call? 'SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.arkadiko-token burn vault-address (unwrap-panic (get coins-minted vault)))))
          success (match (stx-transfer? (unwrap-panic (get stx-collateral vault)) stx-reserve-address stx-liquidation-reserve)
            transferred (begin
              (let ((stx-collateral (get stx-collateral vault)))
                (map-delete vaults { user: tx-sender })
                (ok stx-collateral)
              )
            )
            error (err err-transfer-failed)
          )
          error (err err-burn-failed)
        )
      )
    )
    (err err-unauthorized)
  )
)
