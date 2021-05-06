;; DIKO Init - Foundation and founders
;; 

(use-trait mock-ft-trait .mock-ft-trait.mock-ft-trait)

;; Errors
(define-constant ERR-NOT-AUTHORIZED (err u22401))

;; Constants
(define-constant BLOCKS-PER-MONTH u4320) ;; 144 * 30
(define-constant TOTAL-FOUNDERS u21000000000000) ;; 21m
(define-constant TOTAL-FOUNDATION u15000000000000) ;; 15m
(define-constant FOUNDERS-TOKENS-PER-MONTH u437500000000) ;; 437.500

;; Variables
(define-data-var contract-start-block uint block-height)
(define-data-var founders-wallet principal tx-sender)
(define-data-var founders-tokens-claimed uint u0) 

;; ---------------------------------------------------------
;; Founders
;; ---------------------------------------------------------

;; Set founders wallet to new address
(define-public (set-founders-wallet (address principal))
  (let (
    (wallet (var-get founders-wallet))
  )
    (asserts! (is-eq wallet tx-sender) ERR-NOT-AUTHORIZED)
    (var-set founders-wallet address)
    (ok true)
  )
)

;; Get number of founders tokens claimed already
(define-read-only (get-claimed-founders-tokens)
  (var-get founders-tokens-claimed)
)

;; Get amount of tokens founders can claim
;; The founders are vested on 4 years, with a 6 months cliff.
;; Vesting happens monthly. 21m / 48 months = 437.500 per month
(define-read-only (get-pending-founders-tokens)
  (let (
    ;; Current month number after start
    (month-number (/ (- block-height (var-get contract-start-block)) BLOCKS-PER-MONTH))
  )
    ;; Vesting period
    (if (and (>= month-number u6) (<= month-number u47))
      (let (
        (max-tokens (* month-number FOUNDERS-TOKENS-PER-MONTH))
        (claimed-tokens (var-get founders-tokens-claimed))
      )
        (ok (- max-tokens claimed-tokens)) 
      )
      ;; Vesting ended
      (if (> month-number u47)
        (let (
          (max-tokens (* u48 FOUNDERS-TOKENS-PER-MONTH))
          (claimed-tokens (var-get founders-tokens-claimed))
        )
          (ok (- max-tokens claimed-tokens)) 
        )
        ;; Vesting did not start yet
        (ok u0)
      )
    )
  )
)

;; Claim tokens for team
(define-public (founders-claim-tokens (amount uint))
  (let (
    (pending-tokens (unwrap! (get-pending-founders-tokens) ERR-NOT-AUTHORIZED))
    (claimed-tokens (var-get founders-tokens-claimed))
    (wallet (var-get founders-wallet))
  )
    (asserts! (is-eq wallet tx-sender) ERR-NOT-AUTHORIZED)
    (asserts! (>= pending-tokens amount) ERR-NOT-AUTHORIZED)
    (var-set founders-tokens-claimed (+ claimed-tokens amount))
    (contract-call? .arkadiko-token transfer amount .diko-init wallet)
  )
)

;; Initialize the contract
(begin
    (contract-call? .dao mint-token .arkadiko-token (+ TOTAL-FOUNDATION TOTAL-FOUNDERS) .diko-init)
)

