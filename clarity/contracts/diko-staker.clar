;; DIKO Staker
;; Smart Contract to stake DIKO - the Arkadiko governance token
;; Staking DIKO will make the staker eligible to get a piece of Arkadiko Protocol revenue 

;; errors
(define-constant ERR-NOT-AUTHORIZED u16401)
(define-constant CONTRACT-OWNER tx-sender)

(define-map stakers
  { staker: principal }
  {
    udiko: uint, ;; micro diko amount staked
    last-payout: uint ;; block height
  }
)
(define-data-var last-payout-block uint u0)
(define-data-var total-uamount-staked uint u0)
(define-data-var staker-principals (list 2000 principal) (list CONTRACT-OWNER))

(define-read-only (get-staker (staker principal))
  (default-to
    { udiko: u0, last-payout: u0 }
    (map-get? stakers { staker: staker })
  )
)

(define-public (stake (staker principal) (uamount uint))
  (let ((entry (get-staker staker)))
    (try! (contract-call? .stdiko-token transfer tx-sender (as-contract tx-sender)))
    (var-set total-uamount-staked (+ (var-get total-uamount-staked) uamount))
    (map-set stakers
      { staker: staker }
      (merge entry {
        udiko: (+ uamount (get udiko entry))
      })
    )
    (ok true)
  )
)

(define-public (unstake (staker principal) (uamount uint))
  (let ((entry (get-staker staker)))
    (try! (contract-call? .stdiko-token transfer (as-contract tx-sender) tx-sender))
    (var-set total-uamount-staked (- (var-get total-uamount-staked) uamount))
    (map-set stakers
      { staker: staker }
      (merge entry {
        udiko: (+ uamount (get udiko entry))
      })
    )
    (ok true)
  )
)
