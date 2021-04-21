;; 
;; 
;; 
;; 

(use-trait mock-ft-trait .mock-ft-trait.mock-ft-trait)
(use-trait stake-pool-trait .stake-pool-trait.stake-pool-trait)

;; Errors
(define-constant unauthorized-err (err u15))
(define-constant invalid-pool-err (err u65))
(define-constant pool-already-exist-err (err u66))
(define-constant pool-inactive-err (err u67))

;; Variables
(define-constant dao-owner tx-sender)
(define-data-var pool-count uint u0)

;; Pool maps
(define-map pools-map
  { pool-id: uint }
  {
    pool: principal
  }
)
(define-map pools-data-map
  { pool: principal }
  {
    name: (string-ascii 256),
    active: bool
  }
)

;; Get pool contract
(define-read-only (get-pool-contract (pool-id uint))
  (unwrap-panic (map-get? pools-map { pool-id: pool-id }))
)

;; Get pool info
(define-read-only (get-pool-data (pool-trait <stake-pool-trait>))
  (unwrap-panic (map-get? pools-data-map { pool: (contract-of pool-trait) }))
)

;; Register and activate new pool
(define-public (activate-pool (name (string-ascii 256)) (pool-trait <stake-pool-trait>))
    (begin
        ;; (asserts! (is-eq dao-owner tx-sender) unauthorized-err)
        (let ( 
            (pool (contract-of pool-trait)) 
            (pool-id (var-get pool-count)) 
            (pool-does-not-exist (is-none (map-get? pools-data-map { pool: pool} )))
            )
            (begin
                (asserts! (is-eq pool-does-not-exist true) pool-already-exist-err)
                (map-set pools-map { pool-id: pool-id } { pool: pool})
                (map-set pools-data-map { pool: pool } { name: name, active: true })
                (var-set pool-count (+ pool-id u1))
                (ok true)
            )
        )
    )
)

;; Inactivate pool
(define-public (inactivate-pool (pool-trait <stake-pool-trait>))
    (begin
        ;; (asserts! (is-eq dao-owner tx-sender) unauthorized-err)
        (let ( 
            (pool (contract-of pool-trait)) 
            (pool-info (unwrap! (map-get? pools-data-map { pool: pool }) invalid-pool-err))
            )
            (begin
                (map-set pools-data-map { pool: pool } { name: (get name pool-info), active: false })
                (ok true)
            )
        )
    )
)


;; Stake tokens
(define-public (stake (pool-trait <stake-pool-trait>) (token-trait <mock-ft-trait>) (amount uint))
    (begin
        (let (
            (pool (contract-of pool-trait)) 
            (pool-info (unwrap! (map-get? pools-data-map { pool: pool }) pool-inactive-err))
        )
            (asserts! (is-eq (get active pool-info) true) pool-already-exist-err)
            (try! (contract-call? pool-trait stake token-trait tx-sender amount))
            (ok amount)
        )
    )
)

;; Unstake tokens
(define-public (unstake (pool-trait <stake-pool-trait>) (token-trait <mock-ft-trait>) (amount uint))
    (begin
        (let (
            (pool (contract-of pool-trait)) 
            (pool-info (unwrap! (map-get? pools-data-map { pool: pool }) pool-inactive-err))
        )
            (asserts! (is-eq (get active pool-info) true) pool-already-exist-err)
            (try! (contract-call? pool-trait unstake token-trait tx-sender amount))
            (ok amount)
        )
    )
)

;; Get pending pool rewards
(define-read-only (get-pending-rewards (pool-trait <stake-pool-trait>))
    (begin
        (let (
            (pool (contract-of pool-trait)) 
            (pool-info (unwrap! (map-get? pools-data-map { pool: pool }) pool-inactive-err))
        )
            (asserts! (is-eq (get active pool-info) true) pool-already-exist-err)

            ;; (contract-call? pool-trait get-pending-rewards tx-sender)
            (ok u1)
        )
    )
)

;; Claim pool rewards
(define-public (claim-rewards (pool-trait <stake-pool-trait>) (amount uint))
    (begin
        (let (
            (pool (contract-of pool-trait)) 
            (pool-info (unwrap! (map-get? pools-data-map { pool: pool }) pool-inactive-err))
        )
            (asserts! (is-eq (get active pool-info) true) pool-already-exist-err)
            (ok (contract-call? pool-trait claim-pending-rewards tx-sender amount))
        )
    )
)