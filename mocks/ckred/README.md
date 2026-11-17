# ckRED test token

`scripts/icp-network-start` deploys an ICRC-1 ledger and index for the ckRED test token on the local network. The import token end-to-end tests import it. The ledger has 7 decimals and a fee of 4000 units, like the snsdemo environment had.

The test account of the "Get tokens" menu, see `frontend/src/lib/api/dev.api.ts`, holds the initial supply. The anonymous principal is the minting account.
