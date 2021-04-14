(impl-trait .mock-ft-trait.mock-ft-trait)

;; Defines the xUSD Stablecoin according to the SRC20 Standard
(define-fungible-token xusd)

(define-constant err-burn-failed u1)

(define-read-only (get-total-supply)
  (ok (ft-get-supply xusd))
)

(define-read-only (get-name)
  (ok "xUSD")
)

(define-read-only (get-symbol)
  (ok "xUSD")
)

(define-read-only (get-decimals)
  (ok u6)
)

(define-read-only (get-balance-of (account principal))
  (ok (ft-get-balance xusd account))
)

;; TODO - finalize before mainnet deployment
(define-read-only (get-token-uri)
  (ok none)
)

(define-public (transfer (amount uint) (sender principal) (recipient principal))
  (begin
    (ft-transfer? xusd amount sender recipient)
  )
)

(define-public (mint (amount uint) (recipient principal))
  (begin
    (if
      (and
        (or
          (is-eq contract-caller .freddie)
          (is-eq contract-caller .stx-reserve)
          (is-eq contract-caller .sip10-reserve)
        )
        (is-ok (ft-mint? xusd amount recipient))
      )
      (ok amount)
      (err false)
    )
  )
)

(define-public (burn (amount uint) (sender principal))
  (if (or
    (is-eq contract-caller .freddie)
    (is-eq contract-caller .auction-engine)
  )
    (ok (unwrap! (ft-burn? xusd amount sender) (err err-burn-failed)))
    (err err-burn-failed)
  )
)

;; Initialize the contract
(begin
  ;; Testnet only: seed wallet_2 and wallet_3
  (asserts! is-in-regtest (ok u0))
  (try! (ft-mint? xusd u20 'ST20ATRN26N9P05V2F1RHFRV24X8C8M3W54E427B2))
  (try! (ft-mint? xusd u10 'ST21HMSJATHZ888PD0S0SSTWP4J61TCRJYEVQ0STB)))
