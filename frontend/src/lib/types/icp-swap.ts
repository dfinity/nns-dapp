export interface IcpSwapTicker {
  ticker_id: string; // E.g. "ne2vj-6yaaa-aaaag-qb3ia-cai"
  ticker_name: string; // E.g. "CHAT_ICP"
  base_id: string; // E.g. "2ouva-viaaa-aaaaq-aaamq-cai" (This is the OpenChat ledger canister ID)
  base_currency: string; // E.g. "CHAT"
  target_id: string; // E.g. "ryjl3-tyaaa-aaaaa-aaaba-cai" (This is always the same for ICP based tickers)
  target_currency: string; // E.g. "ICP"
  last_price: string; // E.g. "26.476703"
  base_volume: string; // E.g. "14707114.222300"
  target_volume: string; // E.g. "14639835.630040"
  base_volume_24H: string; // E.g. "22003.751724"
  target_volume_24H: string; // E.g. "835.647456"
  total_volume_usd: string; // E.g. "12946455.718022"
  volume_usd_24H: string; // E.g. "9360.261112"
  fee_usd: string; // E.g. "15.411505"
  liquidity_in_usd: string; // E.g. "493835.903685
}
