(impl-trait .mock-ft-trait.mock-ft-trait)

;; Defines the stDIKO (Staked DIKO) token according to the SIP-010 Standard
(define-fungible-token stdiko)

(define-data-var token-uri (string-utf8 256) u"")

;; errors
(define-constant ERR-BURN-FAILED u151)
(define-constant ERR-NOT-AUTHORIZED u15401)

(define-constant CONTRACT-OWNER tx-sender)

(define-read-only (get-total-supply)
  (ok (ft-get-supply stdiko))
)

(define-read-only (get-name)
  (ok "Staked DIKO")
)

(define-read-only (get-symbol)
  (ok "stDIKO")
)

(define-read-only (get-decimals)
  (ok u6)
)

(define-read-only (get-balance-of (account principal))
  (ok (ft-get-balance stdiko account))
)

(define-public (set-token-uri (value (string-utf8 256)))
  (if (is-eq tx-sender CONTRACT-OWNER)
    (ok (var-set token-uri value))
    (err ERR-NOT-AUTHORIZED)
  )
)

(define-read-only (get-token-uri)
  (ok (some (var-get token-uri)))
)

(define-public (transfer (amount uint) (sender principal) (recipient principal))
  (ft-transfer? stdiko amount sender recipient)
)

(define-public (mint (amount uint) (recipient principal))
  (begin
    (if
      (and
        (is-eq contract-caller .diko-staker)
        (is-ok (ft-mint? stdiko amount recipient))
      )
      (ok amount)
      (err false)
    )
  )
)

(define-public (burn (amount uint) (sender principal))
  (begin
    (asserts! (is-eq contract-caller .diko-staker) (err ERR-BURN-FAILED))
    (ft-burn? xusd amount sender)
  )
)
