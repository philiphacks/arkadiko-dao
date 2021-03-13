;; addresses
(define-constant stx-liquidation-reserve 'S02J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKPVKG2CE)

(define-map auctions
  { id: uint }
  {
    id: uint,
    collateral-type: (string-ascii 10),
    collateral-amount: uint,
    debt-to-raise: uint,
    vault-id: uint,
    is-open: bool,
    ends-at: uint
  }
)
(define-map bids { auction-id: uint } { xusd: uint, collateral-amount: uint })
(define-data-var last-auction-id uint u0)
(define-data-var auction-ids (list 2000 uint) (list u0))

(define-read-only (get-auction-by-id (id uint))
  (unwrap!
    (map-get? auctions { id: id })
    (tuple
      (id u0)
      (collateral-type "")
      (collateral-amount u0)
      (debt-to-raise u0)
      (vault-id u0)
      (is-open false)
      (ends-at u0)
    )
  )
)

(define-read-only (get-auction-id)
  (ok (var-get auction-ids))
)

(define-read-only (get-auctions)
  (ok (map get-auction-by-id (var-get auction-ids)))
)

;; stx-collateral has been posted in stx-liquidation-reserve principal
;; 1. Create auction object in map
;; 2. Add auction ID to list (to show in UI)
;; we wanna sell as little collateral as possible to cover the vault's debt
;; if we cannot cover the vault's debt with the collateral sale,
;; we will have to sell some governance or STX tokens from the reserve
(define-public (start-auction (vault-id uint) (ustx-amount uint) (debt-to-raise uint))
  (let ((auction-id (+ (var-get last-auction-id) u1)))
    (map-set auctions
      { id: auction-id }
      {
        id: auction-id,
        collateral-type: "stx",
        collateral-amount: ustx-amount,
        debt-to-raise: debt-to-raise,
        vault-id: vault-id,
        ends-at: (+ block-height u200),
        is-open: true
      }
    )
    (print "Added new open auction")
    (var-set auction-ids (unwrap-panic (as-max-len? (append (var-get auction-ids) auction-id) u2000)))
    (var-set last-auction-id auction-id)
    (ok true)
  )
)

;; calculates the minimum collateral amount to sell
;; e.g. if we need to cover 10 xUSD debt, and we have 20 STX at $1/STX,
;; we only need to auction off 10 STX
(define-read-only (calculate-minimum-collateral-amount (auction-id uint))
  (let ((stx-price-in-cents (contract-call? .oracle get-price)))
    (let ((auction (get-auction-by-id auction-id)))
      (ok (/ (get debt-to-raise auction) (get price stx-price-in-cents)))
    )
  )
)

(define-read-only (get-last-bid (auction-id uint))
  (unwrap!
    (map-get? bids { auction-id: auction-id })
    (tuple
      (xusd u0)
      (collateral-amount u0)
    )
  )
)

;; TODO - check if bid is better than last bid, for simplicity we only save the last (best) bid
(define-public (bid (auction-id uint) (xusd uint) (collateral-amount uint))
  (let ((auction (get-auction-by-id auction-id)))
    (map-set bids
      { auction-id: auction-id }
      {
        xusd: xusd,
        collateral-amount: collateral-amount
      }
    )
    (if
      (or
        (>= xusd (get debt-to-raise auction))
        (>= block-height (get ends-at auction))
      )
      ;; we raised enough xUSD to cover the vault's debt
      (ok true)
      (ok true)
    )
  )
)
