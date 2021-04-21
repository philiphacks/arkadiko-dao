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
(define-constant ERR-RECENTLY-PAID u152)

(define-constant CONTRACT-OWNER tx-sender)
(define-constant PAYOUT-BLOCK-PERIOD u1008) ;; 7*144 => payout weekly

;; (define-data-var last-payout-block uint u0)
;; (define-data-var total-uamount-staked uint u0)
;; (define-data-var last-list-index uint u0)
;; (define-data-var list-ids (list 10 uint) (list u0))

;; (define-map stakers
;;   { staker: principal }
;;   {
;;     initiated: bool,
;;     udiko: uint, ;; micro diko amount staked
;;     staking-since: uint, ;; block height started staking
;;     last-payout: uint, ;; block height last paid
;;     list-index: uint ;; to which list in staker-principals the staker belongs
;;   }
;; )
;; (define-map staker-principals
;;   { id: uint }
;;   {
;;     principals: (list 10 principal)
;;   }
;; )

;; (define-read-only (get-staker (staker principal))
;;   (default-to
;;     { initiated: false, udiko: u0, staking-since: u0, last-payout: u0, list-index: u0 }
;;     (map-get? stakers { staker: staker })
;;   )
;; )

;; (define-read-only (get-staker-list (id uint))
;;   (default-to
;;     (list CONTRACT-OWNER)
;;     (get principals (map-get? staker-principals { id: id }))
;;   )
;; )

;; (define-public (stake (uamount uint))
;;   (let (
;;     (entry (get-staker tx-sender))
;;     (current-list-index (var-get last-list-index))
;;   )
;;     (try! (contract-call? .arkadiko-token transfer uamount tx-sender (as-contract tx-sender)))
;;     (try! (ft-mint? stdiko uamount tx-sender))

;;     (var-set total-uamount-staked (+ (var-get total-uamount-staked) uamount))
;;     (if (not (get initiated entry))
;;       (begin
;;         (let ((staker-list (get-staker-list current-list-index)))
;;           ;; this is a new staker
;;           (map-set staker-principals
;;             { id : current-list-index }
;;             {
;;               principals: (unwrap-panic (as-max-len? (append staker-list tx-sender) u10))
;;             }
;;           )
;;           (if (is-eq (len staker-list) u10)
;;             (begin
;;               (var-set last-list-index (+ u1 current-list-index))
;;               (var-set list-ids (unwrap-panic (as-max-len? (append (var-get list-ids) (var-get last-list-index)) u10)))
;;             )
;;             true
;;           )
;;         )
;;       )
;;       true
;;     )
;;     (map-set stakers
;;       { staker: tx-sender }
;;       (merge entry {
;;         initiated: true,
;;         udiko: (+ uamount (get udiko entry)),
;;         staking-since: block-height,
;;         list-index: current-list-index
;;       })
;;     )
;;     (ok true)
;;   )
;; )

;; (define-public (unstake (uamount uint))
;;   (let ((entry (get-staker tx-sender)))
;;     (try! (contract-call? .arkadiko-token transfer uamount (as-contract tx-sender) tx-sender))
;;     (try! (ft-burn? stdiko uamount tx-sender))

;;     (var-set total-uamount-staked (- (var-get total-uamount-staked) uamount))
;;     (map-set stakers
;;       { staker: tx-sender }
;;       (merge entry {
;;         udiko: (- (get udiko entry) uamount)
;;       })
;;     )
;;     (ok true)
;;   )
;; )

;; ;; pay all stakers based on how long they have been staking
;; (define-public (payout)
;;   (ok (map payout-lists (var-get list-ids)))
;; )

;; (define-private (payout-lists (list-id uint))
;;   (ok (map payout-principal (get-staker-list list-id)))
;; )

;; (define-public (payout-principal (staker principal))
;;   (let ((stake-info (get-staker staker)))
;;     (asserts! (>= (- block-height PAYOUT-BLOCK-PERIOD) (get last-payout stake-info)) (err ERR-RECENTLY-PAID))

;;     (try! (contract-call? .freddie pay-staking-reward staker (get staking-since stake-info)))
;;     (map-set stakers { staker: staker } (merge stake-info { last-payout: block-height }))
;;     (ok true)
;;   )
;; )

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

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq contract-caller .stake-pool) (err ERR-NOT-AUTHORIZED))
    (ft-mint? stdiko amount recipient)
  )
)

(define-public (burn (amount uint) (sender principal))
  (ft-burn? stdiko amount sender)
)
