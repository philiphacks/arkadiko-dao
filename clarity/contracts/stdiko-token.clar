(impl-trait .mock-ft-trait.mock-ft-trait)

;; Defines the stDIKO (Staked DIKO) token according to the SIP-010 Standard
;; Also has the logic for a DIKO Staker
;; Smart Contract to stake DIKO - the Arkadiko governance token
;; Staking DIKO will make the staker eligible to get a piece of Arkadiko Protocol revenue
(define-fungible-token stdiko)

(define-data-var token-uri (string-utf8 256) u"")

;; errors
(define-constant ERR-NOT-SUPPORTED u151)
(define-constant ERR-NOT-AUTHORIZED u15401)

(define-constant CONTRACT-OWNER tx-sender)

(define-data-var last-payout-block uint u0)
(define-data-var total-uamount-staked uint u0)
(define-map stakers
  { staker: principal }
  {
    udiko: uint, ;; micro diko amount staked
    last-payout: uint ;; block height
  }
)

(define-read-only (get-staker (staker principal))
  (default-to
    { udiko: u0, last-payout: u0 }
    (map-get? stakers { staker: staker })
  )
)

(define-data-var staker-principals (list 2000 principal) (list CONTRACT-OWNER))

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

(define-public (stake (uamount uint))
  (let ((entry (get-staker tx-sender)))
    (try! (contract-call? .arkadiko-token transfer uamount tx-sender (as-contract tx-sender)))
    (try! (ft-mint? stdiko uamount tx-sender))
    (var-set total-uamount-staked (+ (var-get total-uamount-staked) uamount))
    (map-set stakers
      { staker: tx-sender }
      (merge entry {
        udiko: (+ uamount (get udiko entry))
      })
    )
    (ok true)
  )
)

(define-public (unstake (uamount uint))
  (let ((entry (get-staker tx-sender)))
    (try! (contract-call? .arkadiko-token transfer uamount (as-contract tx-sender) tx-sender))
    (try! (ft-burn? stdiko uamount tx-sender))

    (var-set total-uamount-staked (- (var-get total-uamount-staked) uamount))
    (map-set stakers
      { staker: tx-sender }
      (merge entry {
        udiko: (+ uamount (get udiko entry))
      })
    )
    (ok true)
  )
)

(define-public (transfer (amount uint) (sender principal) (recipient principal))
  (ft-transfer? stdiko amount sender recipient)
)

;; mint through the stake function
(define-public (mint (amount uint) (recipient principal))
  (err ERR-NOT-SUPPORTED)
)

;; burn through the unstake function
(define-public (burn (amount uint) (sender principal))
  (err ERR-NOT-SUPPORTED)
)
