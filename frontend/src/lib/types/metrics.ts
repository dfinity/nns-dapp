import type { BinanceAvgPrice } from "$lib/types/binance";
import type { DissolvingNeurons } from "$lib/types/governance-metrics";

export interface MetricsSync {
  avgPrice: BinanceAvgPrice | null;
  dissolvingNeurons: DissolvingNeurons | null;
}
