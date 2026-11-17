# Mock ICP Swap price feed

`scripts/icp-network-start` deploys this directory to an asset canister on the local network. The nns-dapp reads the ICP price from `/tickers`, in the format of https://uvevg-iyaaa-aaaak-ac27q-cai.raw.ic0.app/tickers.

The ckUSDC ticker sets the ICP price to 9 USD. Its `base_id` is the ckUSDC ledger ID that the frontend uses when the network has no ckUSDC ledger.
