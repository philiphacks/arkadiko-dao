;; Arkadiko DAO
;; 1. See all proposals
;; 2. Vote on a proposal
;; 3. Submit new proposal (hold token supply >= 1%)

;; errors
(define-constant err-not-enough-balance u1)
(define-constant err-transfer-failed u2)

(define-constant proposal-reserve 'S02J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKPVKG2CE)
(define-map proposals
  { id: uint }
  {
    id: uint,
    proposer: principal,
    is-open: bool,
    start-block-height: uint,
    end-block-height: uint,
    yes-votes: uint,
    no-votes: uint,
    details: (string-ascii 256)
  }
)
(define-data-var proposal-count uint u0)
(define-map votes-by-member { proposal-id: uint, member: principal } { has-voted: bool })
;; IDEA: create map of default proposals that are templates
;; (define-map default-proposals
;;   { id: uint },
;;   {
;;     options: uint
;;   }
;; )
;; (try! (ft-mint? xusd u20 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7))
;; (try! (ft-mint? xusd u10 'S02J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKPVKG2CE))

(define-read-only (get-proposal-by-id (proposal-id uint))
  (unwrap!
    (map-get? proposals {id: proposal-id})
    (tuple
      (id u0)
      (proposer 'S02J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKPVKG2CE)
      (is-open false)
      (start-block-height u0)
      (end-block-height u0)
      (yes-votes u0)
      (no-votes u0)
      (details (unwrap-panic (as-max-len? "" u256)))
    )
  )
)

;; Start a proposal
;; Requires 1% of the supply in your wallet
;; Default voting period is 10 days (144 * 10 blocks)
;; 
(define-public (propose (start-block-height uint) (details (string-ascii 256)))
  (let ((proposer-balance (unwrap-panic (contract-call? .arkadiko-token balance-of tx-sender))))
    (let ((supply (unwrap-panic (contract-call? .arkadiko-token total-supply))))
      (let ((proposal-id (+ u1 (var-get proposal-count))))
        (if (>= (* proposer-balance u100) supply)
          (begin
            (map-set proposals
              { id: proposal-id }
              {
                id: proposal-id,
                proposer: tx-sender,
                is-open: true,
                start-block-height: start-block-height,
                end-block-height: (+ start-block-height u1440),
                yes-votes: u0,
                no-votes: u0,
                details: details
              }
            )
            (ok true)
          )
          (err err-not-enough-balance) ;; need at least 1% 
        )
      )
    )
  )
)

;; TODO: check if person has already voted or not
(define-public (vote-for (proposal-id uint) (amount uint))
  (let ((proposal (get-proposal-by-id proposal-id)))
    (if 
      (and
        (is-none (map-get? votes-by-member { proposal-id: proposal-id, member: tx-sender }))
        (unwrap-panic (contract-call? .arkadiko-token transfer proposal-reserve amount))
      )
      (begin
        (map-set proposals
          { id: proposal-id }
          {
            id: proposal-id,
            proposer: (get proposer proposal),
            is-open: true,
            start-block-height: (get start-block-height proposal),
            end-block-height: (get end-block-height proposal),
            yes-votes: (+ amount (get yes-votes proposal)),
            no-votes: (get no-votes proposal),
            details: (get details proposal)
          }
        )
        (map-set votes-by-member { proposal-id: proposal-id, member: tx-sender } { has-voted: true })
        (ok true)
      )
      (err err-transfer-failed)
    )
  )
)

;; TODO: check if person has already voted or not
(define-public (vote-against (proposal-id uint) (amount uint))
  (let ((proposal (get-proposal-by-id proposal-id)))
    (if 
      (and
        (is-none (map-get? votes-by-member { proposal-id: proposal-id, member: tx-sender }))
        (unwrap-panic (contract-call? .arkadiko-token transfer proposal-reserve amount))
      )
      (begin
        (map-set proposals
          { id: proposal-id }
          {
            id: proposal-id,
            proposer: (get proposer proposal),
            is-open: true,
            start-block-height: (get start-block-height proposal),
            end-block-height: (get end-block-height proposal),
            yes-votes: (get yes-votes proposal),
            no-votes: (+ amount (get no-votes proposal)),
            details: (get details proposal)
          }
        )
        (map-set votes-by-member { proposal-id: proposal-id, member: tx-sender } { has-voted: true })
        (ok true)
      )
      (err err-transfer-failed)
    )
  )
)
