;; Stacks the STX tokens in POX
;; pox contract: SP000000000000000000002Q6VF78.pox
;; https://explorer.stacks.co/txid/0x41356e380d164c5233dd9388799a5508aae929ee1a7e6ea0c18f5359ce7b8c33?chain=mainnet

(define-public (pox-stack-stx (amount-ustx uint)
                              (pox-addr (tuple (version (buff 1)) (hashbytes (buff 20))))
                              (start-burn-ht uint)
                              (lock-period uint))
  ;; do it
)
