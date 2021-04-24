(use-trait mock-ft-trait .mock-ft-trait.mock-ft-trait)

;; Arkadiko governance
;; 
;; Can see, vote and submit a new proposal
;; A proposal will just update the DAO with new contracts.

;; Errors
(define-constant ERR-NOT-ENOUGH-BALANCE u31)
(define-constant ERR-TRANSFER-FAILED u32)
(define-constant ERR-PROPOSAL-NOT-RECOGNIZED u33)
(define-constant ERR-NOT-AUTHORIZED u3401)
(define-constant STATUS-OK u3200)

;; Constants
(define-constant DAO-OWNER tx-sender)

;; Proposal variables
(define-map proposals
  { id: uint }
  {
    id: uint,
    proposer: principal,
    details: (string-utf8 256),
    is-open: bool,
    start-block-height: uint,
    end-block-height: uint,
    yes-votes: uint,
    no-votes: uint
  }
)

(define-data-var proposal-count uint u0)
(define-data-var proposal-ids (list 100 uint) (list u0))
(define-map votes-by-member { proposal-id: uint, member: principal } { vote-count: uint })


;; Get all proposals
(define-read-only (get-proposals)
  (ok (map get-proposal-by-id (var-get proposal-ids)))
)

;; Get all proposal IDs
(define-read-only (get-proposal-ids)
  (ok (var-get proposal-ids))
)

;; Get votes for a member on proposal
(define-read-only (get-votes-by-member-by-id (proposal-id uint) (member principal))
  (default-to 
    { vote-count: u0 }
    (map-get? votes-by-member { proposal-id: proposal-id, member: member })
  )
)

;; Get proposal details
(define-read-only (get-proposal-by-id (proposal-id uint))
  (default-to
    {
      id: u0,
      proposer: DAO-OWNER,
      details: u"",
      is-open: false,
      start-block-height: u0,
      end-block-height: u0,
      yes-votes: u0,
      no-votes: u0
    }
    (map-get? proposals { id: proposal-id })
  )
)


;; Start a proposal
;; Requires 1% of the supply in your wallet
;; Default voting period is 10 days (144 * 10 blocks)
(define-public (propose
    (start-block-height uint)
    (details (string-utf8 256))
  )
  (let (
    (proposer-balance (unwrap-panic (contract-call? .arkadiko-token get-balance-of tx-sender)))
    (supply (unwrap-panic (contract-call? .arkadiko-token get-total-supply)))
    (proposal-id (+ u1 (var-get proposal-count)))
  )
    ;; Requires 1% of the supply 
    (asserts! (>= (* proposer-balance u100) supply) (err ERR-NOT-ENOUGH-BALANCE))
    ;; Mutate
    (map-set proposals
      { id: proposal-id }
      {
        id: proposal-id,
        proposer: tx-sender,
        details: details,
        is-open: true,
        start-block-height: start-block-height,
        end-block-height: (+ start-block-height u1440),
        yes-votes: u0,
        no-votes: u0
      }
    )
    (var-set proposal-count proposal-id)
    (var-set proposal-ids (unwrap-panic (as-max-len? (append (var-get proposal-ids) proposal-id) u100)))
    (ok true)
  )
)

(define-public (vote-for (proposal-id uint) (amount uint))
  (let (
    (proposal (get-proposal-by-id proposal-id))
    (vote-count (get vote-count (get-votes-by-member-by-id proposal-id tx-sender))))
    ;; Proposal should be open for voting
    (asserts! (is-eq (get is-open proposal) true) (err ERR-NOT-AUTHORIZED))
    ;; Vote should be casted after the start-block-height
    (asserts! (>= block-height (get start-block-height proposal)) (err ERR-NOT-AUTHORIZED))
    ;; Voter should be able to stake
    (try! (contract-call? .arkadiko-token transfer amount tx-sender (as-contract tx-sender)))
    ;; Mutate
    (map-set proposals
      { id: proposal-id }
      (merge proposal { yes-votes: (+ amount (get yes-votes proposal)) }))
    (map-set votes-by-member 
      { proposal-id: proposal-id, member: tx-sender }
      { vote-count: (+ vote-count amount) })
    (ok STATUS-OK)
  )
)

(define-public (vote-against (proposal-id uint) (amount uint))
  (let (
    (proposal (get-proposal-by-id proposal-id))
    (vote-count (get vote-count (get-votes-by-member-by-id proposal-id tx-sender))))
    ;; Proposal should be open for voting
    (asserts! (is-eq (get is-open proposal) true) (err ERR-NOT-AUTHORIZED))
    ;; Vote should be casted after the start-block-height
    (asserts! (>= block-height (get start-block-height proposal)) (err ERR-NOT-AUTHORIZED))
    ;; Voter should be able to stake
    (try! (contract-call? .arkadiko-token transfer amount tx-sender (as-contract tx-sender)))
    ;; Mutate
    (map-set proposals
      { id: proposal-id }
      (merge proposal { no-votes: (+ amount (get no-votes proposal)) }))
    (map-set votes-by-member 
      { proposal-id: proposal-id, member: tx-sender }
      { vote-count: (+ vote-count amount) })
    (ok STATUS-OK)
  )
)

(define-public (end-proposal (proposal-id uint))
  (let ((proposal (get-proposal-by-id proposal-id)))
    (asserts! (not (is-eq (get id proposal) u0)) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-eq (get is-open proposal) true) (err ERR-NOT-AUTHORIZED))
    (asserts! (>= block-height (get end-block-height proposal)) (err ERR-NOT-AUTHORIZED))

    (map-set proposals
      { id: proposal-id }
      (merge proposal { is-open: false }))
    ;; TODO: (try! (return-diko)
    (if (> (get yes-votes proposal) (get no-votes proposal))
      (try! (execute-proposal proposal-id))
      false
    )
    (ok STATUS-OK)
  )
)

(define-private (execute-proposal (proposal-id uint))
  (if (>= proposal-id u0)
    (ok true)
    (err ERR-PROPOSAL-NOT-RECOGNIZED)
  )
)

;; (define-private (execute-proposal (proposal-id uint))
;;   (let (
;;     (proposal (get-proposal-by-id proposal-id))
;;     (type (get type proposal))
;;     (changes (get changes proposal))
;;   )
;;     (if (is-eq type "add_collateral_type")
;;       (contract-call? .collateral-types add-collateral-type
;;         (get token proposal)
;;         (get token-name proposal)
;;         (get url proposal)
;;         (get collateral-type proposal)
;;         (unwrap-panic (get new-value (element-at changes u0))) ;; liquidation ratio
;;         (unwrap-panic (get new-value (element-at changes u1))) ;; liquidation penalty
;;         (unwrap-panic (get new-value (element-at changes u2))) ;; stability fee
;;         (unwrap-panic (get new-value (element-at changes u3))) ;; stability fee apy
;;         (unwrap-panic (get new-value (element-at changes u4))) ;; maximum debt
;;         (unwrap-panic (get new-value (element-at changes u5))) ;; collateralization ratio
;;       )
;;       (if (is-eq type "change_risk_parameter")
;;         (contract-call? .collateral-types change-risk-parameters (get collateral-type proposal) changes)
;;         (if (is-eq type "stacking_distribution")
;;           (begin
;;             (var-set stacker-yield (unwrap-panic (get new-value (element-at changes u0))))
;;             (var-set governance-token-yield (unwrap-panic (get new-value (element-at changes u1))))
;;             (var-set governance-reserve-yield (unwrap-panic (get new-value (element-at changes u2))))
;;             (ok true)
;;           )
;;           (if (is-eq type "change_maximum_debt_surplus")
;;             (begin
;;               (var-set maximum-debt-surplus (unwrap-panic (get new-value (element-at changes u0))))
;;               (ok true)
;;             )
;;             (if (is-eq type "emergency_shutdown")
;;               (begin
;;                 (var-set emergency-shutdown-activated (not (var-get emergency-shutdown-activated)))
;;                 (ok true)
;;               )
;;               (if (is-eq type "change_staking_reward")
;;                 (begin
;;                   ;; TODO: set staking reward
;;                   (ok true)
;;                 )
;;                 (if (is-eq type "change_smart_contract")
;;                   (begin
;;                     (map-set contracts
;;                       { name: (get token-name proposal) }
;;                       {
;;                         address: (unwrap-panic (element-at (get contract-changes proposal) u0)),
;;                         qualified-name: (unwrap-panic (element-at (get contract-changes proposal) u1))
;;                       }
;;                     )
;;                     (ok true)
;;                   )
;;                   (err ERR-PROPOSAL-NOT-RECOGNIZED)
;;                 )
;;               )
;;             )
;;           )
;;         )
;;       )
;;     )
;;   )
;; )

