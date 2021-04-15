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

;; Test environments
(begin
  (if is-in-regtest
    (if (is-eq (unwrap-panic (get-block-info? header-hash u1)) 0xd2454d24b49126f7f47c986b06960d7f5b70812359084197a200d691e67a002e)
      (begin ;; Testnet only
        (try! (ft-mint? diko u1000000000000000 'ST2YP83431YWD9FNWTTDCQX8B3K0NDKPCV3B1R30H)))
      (begin ;; Other test environments
        (try! (ft-mint? diko u890000000000 'ST1J4G6RR643BCG8G8SR6M2D9Z9KXT2NJDRK3FBTK))
        (try! (ft-mint? diko u150000000000 'ST20ATRN26N9P05V2F1RHFRV24X8C8M3W54E427B2))
        (try! (ft-mint? diko u150000000000 'ST21HMSJATHZ888PD0S0SSTWP4J61TCRJYEVQ0STB))
        (try! (ft-mint? diko u1000000000 'ST2QXSK64YQX3CQPC530K79XWQ98XFAM9W3XKEH3N))
      )
    )
    true
  )
)
