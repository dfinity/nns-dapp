import type { BinanceAvgPrice } from "$lib/types/binance";

export interface MetricsSync {
  avgPrice: BinanceAvgPrice | null;
}
