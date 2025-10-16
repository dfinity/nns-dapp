export interface KongSwapTicker {
  ticker_id: string;
  base_currency: string; // ledger canister id
  target_currency: string; // ledger canister id
  pool_id: string;
  last_price: number;
  base_volume?: number;
  target_volume?: number;
  liquidity_in_usd?: number;
}


