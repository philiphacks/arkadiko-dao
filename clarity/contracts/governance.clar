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
    no-votes: uint,
    contract-changes: (list 10 (tuple (name (string-ascii 256)) (address principal) (qualified-name principal)))
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
      no-votes: u0,
      contract-changes: (list { name: "", address: DAO-OWNER, qualified-name: DAO-OWNER} )
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
        no-votes: u0,
        contract-changes: (list { name: "", address: DAO-OWNER, qualified-name: DAO-OWNER} )
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

;; Make needed contract changes on DAO
(define-private (execute-proposal (proposal-id uint))

  (let (
    (proposal (get-proposal-by-id proposal-id))
    (contract-changes (get contract-changes proposal))

    (change0 (default-to { name: "", address: DAO-OWNER, qualified-name: DAO-OWNER} (element-at contract-changes u0)))
    (change1 (default-to { name: "", address: DAO-OWNER, qualified-name: DAO-OWNER} (element-at contract-changes u1)))
    (change2 (default-to { name: "", address: DAO-OWNER, qualified-name: DAO-OWNER} (element-at contract-changes u2)))
    (change3 (default-to { name: "", address: DAO-OWNER, qualified-name: DAO-OWNER} (element-at contract-changes u3)))
    (change4 (default-to { name: "", address: DAO-OWNER, qualified-name: DAO-OWNER} (element-at contract-changes u4)))
    (change5 (default-to { name: "", address: DAO-OWNER, qualified-name: DAO-OWNER} (element-at contract-changes u5)))
    (change6 (default-to { name: "", address: DAO-OWNER, qualified-name: DAO-OWNER} (element-at contract-changes u6)))
    (change7 (default-to { name: "", address: DAO-OWNER, qualified-name: DAO-OWNER} (element-at contract-changes u7)))
    (change8 (default-to { name: "", address: DAO-OWNER, qualified-name: DAO-OWNER} (element-at contract-changes u8)))
    (change9 (default-to { name: "", address: DAO-OWNER, qualified-name: DAO-OWNER} (element-at contract-changes u9)))
  )
    (if (>= proposal-id u0)
      (begin
        (try! (execute-proposal-change-contract change0))
        (try! (execute-proposal-change-contract change1))
        (try! (execute-proposal-change-contract change2))
        (try! (execute-proposal-change-contract change3))
        (try! (execute-proposal-change-contract change4))
        (try! (execute-proposal-change-contract change5))
        (try! (execute-proposal-change-contract change6))
        (try! (execute-proposal-change-contract change7))
        (try! (execute-proposal-change-contract change8))
        (try! (execute-proposal-change-contract change9))

        (ok true)
      )
      (err ERR-PROPOSAL-NOT-RECOGNIZED)
    )
  )
)

;; Helper to execute proposal and change contracts
(define-private (execute-proposal-change-contract (change (tuple (name (string-ascii 256)) (address principal) (qualified-name principal))))
  (let (
    (name (get name change))
    (address (get address change))
    (qualified-name (get qualified-name change))
  )
    (if (not (is-eq name ""))
      (begin
        (try! (contract-call? .dao set-contract-address name address qualified-name))
        (ok true)
      )
      (ok false)
    )
  )
)
