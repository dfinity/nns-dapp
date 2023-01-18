import type { BinanceAvgPrice } from "$lib/types/binance";

export interface DashboardSync {
  avgPrice: BinanceAvgPrice | null;
}
