(impl-trait .mock-ft-trait.mock-ft-trait)

;; Defines the Arkadiko Governance Token according to the SRC20 Standard
(define-fungible-token diko)

;; errors
(define-constant err-unauthorized u1)

(define-read-only (get-total-supply)
  (ok (ft-get-supply diko))
)

(define-read-only (get-name)
  (ok "Arkadiko")
)

(define-read-only (get-symbol)
  (ok "DIKO")
)

(define-read-only (get-decimals)
  (ok u6)
)

(define-read-only (get-balance-of (account principal))
  (ok (ft-get-balance diko account))
)

;; TODO - finalize before mainnet deployment
(define-read-only (get-token-uri)
  (ok none)
)

(define-public (transfer (amount uint) (sender principal) (recipient principal))
  (begin
    (ft-transfer? diko amount sender recipient)
  )
)

;; TODO - finalize before mainnet deployment
(define-public (mint (amount uint) (recipient principal))
  (err err-unauthorized)
)

(define-public (burn (amount uint) (sender principal))
  (ok (ft-burn? diko amount sender))
)

;; MOCKNET ONLY: Initialize the contract
(begin
  ;; Testnet only.
  (asserts! is-in-regtest (ok u0))
  ;; Seed wallet_1 with 1 billion tokens 
  (try! (ft-mint? diko u1000000000000000 'ST1J4G6RR643BCG8G8SR6M2D9Z9KXT2NJDRK3FBTK)))
