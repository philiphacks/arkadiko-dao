(use-trait mock-ft-trait .mock-ft-trait.mock-ft-trait)

;; Arkadiko DAO 
;; 
;; Keep contracts used in protocol. 
;; Emergency switch to shut down protocol.

(define-constant DAO-OWNER tx-sender)

;; Contract addresses
(define-map contracts
  { name: (string-ascii 256) }
  {
    address: principal, ;; e.g. 'STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7
    qualified-name: principal ;; e.g. 'STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.freddie
  }
)

;; Variables
(define-data-var emergency-shutdown-activated bool false)

;; TODO: 
;; Emergency shutdown should be on freddie?
;; Like our stake-registry which can deactivate pools
;; Each part can shut down independently
(define-read-only (get-emergency-shutdown-activated)
  (ok (var-get emergency-shutdown-activated))
)

;; 
(define-read-only (get-contract-address-by-name (name (string-ascii 256)))
  (get address (map-get? contracts { name: name }))
)

;; 
(define-read-only (get-qualified-name-by-name (name (string-ascii 256)))
  (get qualified-name (map-get? contracts { name: name }))
)

;; Private methods
;; TODO: governance should be able to add and remove contracts
(define-private (set-contract-address (name (string-ascii 256)) (address principal) (qualified-name principal))
  (begin
    (map-set contracts { name: name } { address: address, qualified-name: qualified-name })
    (ok true)
  )
)

;; TODO: make sip10 trait dynamic
;; Philip, why is this needed??
(define-public (request-diko-tokens (ft <mock-ft-trait>) (collateral-amount uint))
  (contract-call? ft transfer collateral-amount DAO-OWNER (as-contract .sip10-reserve))
)

;; Initialize the contract
(begin
  ;; add contracts
  (map-set contracts
    { name: "freddie" }
    {
      address: 'STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7,
      qualified-name: 'STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.freddie
    }
  )
  (map-set contracts
    { name: "auction-engine" }
    {
      address: 'STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7,
      qualified-name: 'STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.auction-engine
    }
  )
  (map-set contracts
    { name: "oracle" }
    {
      address: 'STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7,
      qualified-name: 'STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.oracle
    }
  )
  (map-set contracts
    { name: "collateral-types" }
    {
      address: 'STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7,
      qualified-name: 'STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.collateral-types
    }
  )
)
