;; DIKO Guardian
;; 
;; 
;; 
;; 

(use-trait mock-ft-trait .mock-ft-trait.mock-ft-trait)

;; Errors
(define-constant ERR-NOT-AUTHORIZED (err u22401))

;; Variables
(define-data-var team-wallet principal tx-sender)


;; Get amount of rewards the stake-registry can disbribute across pools
;; TODO: should decrease each 2 weeks
(define-read-only (get-staking-rewards-per-block)
  u1000000000
)


;; ---------------------------------------------------------
;; Team
;; ---------------------------------------------------------

;; Get amount of tokens team can claim
;; TODO: implement
(define-read-only (get-pending-team-tokens)
  (ok u1000000000)
)

;; Set team wallet to new address
;; TODO: implement
(define-public (set-team-wallet (address principal))
  (begin
    (ok true)
  )
)


;; Claim tokens for team
;; TODO: implement
(define-public (team-claim-tokens (amount uint))
  (begin
    (ok amount)
  )
)

