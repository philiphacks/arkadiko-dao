;; addresses
(define-constant stx-liquidation-reserve 'S02J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKPVKG2CE)

;; errors
(define-constant err-bid-declined u1)
(define-constant err-lot-sold u2)
(define-constant err-poor-bid u3)

(define-map auctions
  { id: uint }
  {
    id: uint,
    collateral-type: (string-ascii 10),
    collateral-amount: uint,
    debt-to-raise: uint,
    vault-id: uint,
    lot-size: uint,
    lots: uint,
    last-lot-size: uint,
    lots-sold: uint,
    is-open: bool,
    ends-at: uint
  }
)
(define-map bids
  { auction-id: uint, lot-index: uint }
  {
    xusd: uint,
    collateral-amount: uint,
    owner: principal,
    is-accepted: bool
  }
)
(define-data-var last-auction-id uint u0)
(define-data-var auction-ids (list 2000 uint) (list u0))
(define-data-var lot-size uint u100000000) ;; 100 STX

(define-read-only (get-auction-by-id (id uint))
  (unwrap!
    (map-get? auctions { id: id })
    (tuple
      (id u0)
      (collateral-type "")
      (collateral-amount u0)
      (debt-to-raise u0)
      (vault-id u0)
      (lot-size u0)
      (lots u0)
      (last-lot-size u0)
      (lots-sold u0)
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
;; 1. Create auction object in map per 100 STX
;; 2. Add auction ID to list (to show in UI)
;; we wanna sell as little collateral as possible to cover the vault's debt
;; if we cannot cover the vault's debt with the collateral sale,
;; we will have to sell some governance or STX tokens from the reserve
(define-public (start-auction (vault-id uint) (ustx-amount uint) (debt-to-raise uint))
  (let ((auction-id (+ (var-get last-auction-id) u1)))
    ;; 500 collateral => 500 / 100 = 5 lots
    (let ((amount-of-lots (+ u1 (/ ustx-amount (var-get lot-size)))))
      (let ((last-lot (mod ustx-amount (var-get lot-size))))
        (map-set auctions
          { id: auction-id }
          {
            id: auction-id,
            collateral-type: "stx",
            collateral-amount: ustx-amount,
            debt-to-raise: debt-to-raise,
            vault-id: vault-id,
            lot-size: (var-get lot-size),
            lots: amount-of-lots,
            last-lot-size: last-lot,
            lots-sold: u0,
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
  )
)

;; calculates the minimum collateral amount to sell
;; e.g. if we need to cover 10 xUSD debt, and we have 20 STX at $1/STX,
;; we only need to auction off 10 STX
(define-read-only (calculate-minimum-collateral-amount (auction-id uint))
  (let ((stx-price-in-cents (contract-call? .oracle get-price)))
    (let ((auction (get-auction-by-id auction-id)))
      (let ((amount (/ (/ (get debt-to-raise auction) (get price stx-price-in-cents)) (get lots auction))))
        (if (> (get collateral-amount auction) amount)
          (ok amount)
          (ok (get collateral-amount auction))
        )
      )
    )
  )
)

(define-read-only (get-last-bid (auction-id uint) (lot-index uint))
  (unwrap!
    (map-get? bids { auction-id: auction-id, lot-index: lot-index })
    (tuple
      (xusd u0)
      (collateral-amount u0)
      (is-accepted false)
    )
  )
)

;; TODO - check if bid is better than last bid, for simplicity we only save the last (best) bid
(define-public (bid (auction-id uint) (lot-index uint) (xusd uint) (collateral-amount uint))
  (let ((auction (get-auction-by-id auction-id)))
    (if
      (and
        (< lot-index (get lots auction))
        (is-eq (get is-open auction) true)
        (<= collateral-amount (/ (get collateral-amount auction) (get lots auction)))
      )
      (ok (unwrap-panic (accept-bid auction-id lot-index xusd collateral-amount)))
      (err err-bid-declined) ;; just silently exit
    )
  )
)

(define-private (accept-bid (auction-id uint) (lot-index uint) (xusd uint) (collateral-amount uint))
  (let ((auction (get-auction-by-id auction-id)))
    (let ((last-bid (get-last-bid auction-id lot-index)))
      (if (not (get is-accepted last-bid))
        (if (> xusd (get xusd last-bid)) ;; we have a better bid and the previous one was not accepted!
          (begin
            (if (>= xusd (/ (get debt-to-raise auction) (get lot-size auction)))
              ;; if this bid is at least (total debt to raise / lot-size) amount, accept it as final - we don't need to be greedy
              (begin
                (map-set bids
                  { auction-id: auction-id, lot-index: lot-index }
                  {
                    xusd: xusd,
                    collateral-amount: collateral-amount,
                    owner: tx-sender,
                    is-accepted: true
                  }
                )
                ;; TODO: bid is accepted, so update lots-sold integer in auction map
                (if
                  (and
                    (>= block-height (get ends-at auction))
                    (is-eq (get lots auction) (get lots-sold auction))
                  )
                  ;; auction is over - close all bids
                  ;; send collateral to winning bidders
                  (ok (unwrap-panic (close-auction auction-id)))
                  (ok true)
                )
              )
              (begin
                (map-set bids
                  { auction-id: auction-id, lot-index: lot-index }
                  {
                    xusd: xusd,
                    collateral-amount: collateral-amount,
                    owner: tx-sender,
                    is-accepted: false
                  }
                )
                (ok true)
              )
            )
          )
          (err err-poor-bid) ;; don't care cause either the bid is already over or it was a poor bid
        )
        (err err-lot-sold) ;; lot is already sold
      )
    )
  )
)

;; 1. flag auction on map as closed
;; 2. go over each lot (0 to lot-size) and send collateral to winning address
;; 3. check if vault debt is covered (sum of xUSD in lots >= debt-to-raise)
;; 4. update vault to allow vault owner to withdraw leftover collateral (if any)
;; 5. if not all vault debt is covered: auction off collateral again
;; 6. if not all vault debt is covered and no collateral is left: cover xUSD with gov token
(define-private (close-auction (auction-id uint))
  (ok true)
)
