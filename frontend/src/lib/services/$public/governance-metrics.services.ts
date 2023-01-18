import { governanceMetrics } from "$lib/rest/governance-metrics.rest";
import type { DissolvingNeurons } from "$lib/types/governance-metrics";

const GOVERNANCE_DISSOLVING_NEURONS_E8S_COUNT_KEY =
  "governance_dissolving_neurons_e8s_count";

export const totalDissolvingNeurons =
  async (): Promise<DissolvingNeurons | null> => {
    const metrics = await governanceMetrics();

    if (metrics === null) {
      return null;
    }

    const splits = metrics.replaceAll(/[\n\r]/g, " ").split(" ");
    const index = splits.findIndex(
      (text: string) => text === GOVERNANCE_DISSOLVING_NEURONS_E8S_COUNT_KEY
    );

    if (index === -1) {
      return null;
    }

    const totalDissolvingNeurons = splits[index + 1];
    const totalNotDissolvingNeurons = splits[index + 2];

    const valid = (metric: string | undefined): boolean =>
      metric !== undefined && !isNaN(Number(metric));

    if (valid(totalDissolvingNeurons) && valid(totalNotDissolvingNeurons)) {
      return {
        totalDissolvingNeurons: Number(totalDissolvingNeurons),
        totalNotDissolvingNeurons: Number(totalNotDissolvingNeurons),
      };
    }

    return null;
  };
