;; Stake Registry - Keep track of all staking pools
;; 
;; Users can stake, unstake and claim rewards from active pools.
;; 
;; DAO can activate a new pool or deactivate an existing one.
;; When a pool is deactivated, users can not stake but they can unstake.

(use-trait mock-ft-trait .mock-ft-trait.mock-ft-trait)
(use-trait stake-pool-trait .stake-pool-trait.stake-pool-trait)

;; Errors
(define-constant ERR-NOT-AUTHORIZED (err u19401))
(define-constant ERR-INVALID-POOL (err u19001))
(define-constant ERR-POOL-EXIST (err u19002))
(define-constant ERR-POOL-INACTIVE (err u19003))

;; Variables
(define-constant DAO-OWNER tx-sender) ;; TODO: needs to become DAO
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
        (asserts! (is-eq DAO-OWNER tx-sender) ERR-NOT-AUTHORIZED)
        (let ( 
            (pool (contract-of pool-trait)) 
            (pool-id (var-get pool-count)) 
            (pool-does-not-exist (is-none (map-get? pools-data-map { pool: pool} )))
            )
            (begin
                (asserts! (is-eq pool-does-not-exist true) ERR-POOL-EXIST)
                (map-set pools-map { pool-id: pool-id } { pool: pool})
                (map-set pools-data-map { pool: pool } { name: name, active: true })
                (var-set pool-count (+ pool-id u1))
                (ok true)
            )
        )
    )
)

;; Inactivate pool
(define-public (deactivate-pool (pool-trait <stake-pool-trait>))
    (begin
        (asserts! (is-eq DAO-OWNER tx-sender) ERR-NOT-AUTHORIZED)
        (let ( 
            (pool (contract-of pool-trait)) 
            (pool-info (unwrap! (map-get? pools-data-map { pool: pool }) ERR-INVALID-POOL))
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
            (pool-info (unwrap! (map-get? pools-data-map { pool: pool }) ERR-POOL-INACTIVE))
        )
            (asserts! (is-eq (get active pool-info) true) ERR-POOL-EXIST)
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
            (pool-info (unwrap! (map-get? pools-data-map { pool: pool }) ERR-POOL-INACTIVE))
        )
            (asserts! (is-eq (get active pool-info) true) ERR-POOL-EXIST)
            (try! (contract-call? pool-trait unstake token-trait tx-sender amount))
            (ok amount)
        )
    )
)

;; Get pending pool rewards
;; TODO: this should be read-only but a bug in traits blocks this from being read-only
;; see https://github.com/blockstack/stacks-blockchain/issues/1981
(define-read-only (get-pending-rewards (pool-trait <stake-pool-trait>))
    (begin
        (let (
            (pool (contract-of pool-trait)) 
            (pool-info (unwrap! (map-get? pools-data-map { pool: pool }) ERR-POOL-INACTIVE))
        )
            (asserts! (is-eq (get active pool-info) true) ERR-POOL-EXIST)

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
            (pool-info (unwrap! (map-get? pools-data-map { pool: pool }) ERR-POOL-INACTIVE))
        )
            (asserts! (is-eq (get active pool-info) true) ERR-POOL-EXIST)
            (ok (contract-call? pool-trait claim-pending-rewards tx-sender amount))
        )
    )
)