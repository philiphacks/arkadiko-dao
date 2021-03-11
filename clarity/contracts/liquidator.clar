;; errors
(define-constant err-liquidation-failed u1)
(define-constant stx-liquidation-reserve 'S02J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKPVKG2CE)

(define-map auctions { id: uint } { id: uint, ustx-amount: uint, is-open: bool })
(define-data-var last-auction-id uint u0)

;; TODO: only callable by a registered stacker?
(define-public (notify-risky-reserve (vault-id uint))
  (let ((collateral-to-debt-ratio (unwrap-panic (contract-call? .stx-reserve calculate-current-collateral-to-debt-ratio vault-id))))
    (let ((liquidation-ratio (unwrap-panic (contract-call? .stx-reserve get-liquidation-ratio))))
      (if (>= collateral-to-debt-ratio liquidation-ratio)
        (begin
          (print "Vault is in danger. Time to liquidate.")
          (let ((stx-collateral (unwrap-panic (as-contract (contract-call? .stx-reserve liquidate vault-id)))))
            (if (unwrap-panic (start-auction stx-collateral))
              (ok true)
              (err err-liquidation-failed)
            )
          )
        )
        (ok true) ;; false alarm - vault is not at risk. just return successful response
      )
    )
  )
)

;; stx-collateral has been posted in stx-liquidation-reserve principal
;; 1. Create auction object in map
;; 2. Allow to publish auction
(define-private (start-auction (ustx-amount uint))
  (let ((auction-id (+ (var-get last-auction-id) u1)))
    (map-set auctions
      { id: auction-id }
      { id: auction-id, ustx-amount: ustx-amount, is-open: true }
    )
    (ok true)
  )
)
