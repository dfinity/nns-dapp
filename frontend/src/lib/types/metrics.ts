import type { BinanceAvgPrice } from "$lib/types/binance";
import type { StakingMetrics } from "$lib/types/dashboard";

export interface MetricsSync {
  avgPrice: BinanceAvgPrice | null;
  dissolvingTotalNeurons: StakingMetrics | null;
  notDissolvingTotalNeurons: StakingMetrics | null;
}
