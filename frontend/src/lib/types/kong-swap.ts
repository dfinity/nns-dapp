export interface KongSwapTicker {
  ticker_id: string;
  base_currency: string;
  target_currency: string;
  pool_id: string;
  last_price: number;
  base_volume?: number;
  target_volume?: number;
  liquidity_in_usd?: number;
}
