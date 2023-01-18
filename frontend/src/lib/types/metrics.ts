import type { BinanceAvgPrice } from "$lib/types/binance";
import type { GovernanceMetrics } from "$lib/types/governance-metrics";

export interface MetricsSync {
  avgPrice: BinanceAvgPrice | null;
  dissolvingNeurons: GovernanceMetrics | null;
}
