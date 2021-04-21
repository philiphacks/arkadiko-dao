(impl-trait .mock-ft-trait.mock-ft-trait)

;; Defines the stDIKO (Staked DIKO) token according to the SIP-010 Standard
;; Also has the logic for a DIKO Staker
;; Smart Contract to stake DIKO - the Arkadiko governance token
;; Staking DIKO will make the staker eligible to get a piece of Arkadiko Protocol revenue
(define-fungible-token stdiko)

(define-data-var token-uri (string-utf8 256) u"")

;; Errors
(define-constant ERR-NOT-AUTHORIZED u15401)

;; Variables
(define-constant CONTRACT-OWNER tx-sender)

;; SIP10 functions

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

;; TODO: Not everyone should be able to mint
(define-public (mint (amount uint) (recipient principal))
  (begin
    ;; TODO: Should be dynamic
    (asserts! (is-eq contract-caller .stake-pool-diko) (err ERR-NOT-AUTHORIZED))
    (ft-mint? stdiko amount recipient)
  )
)

;; TODO: Not everyone should be able to burn
(define-public (burn (amount uint) (sender principal))
  (ft-burn? stdiko amount sender)
)
