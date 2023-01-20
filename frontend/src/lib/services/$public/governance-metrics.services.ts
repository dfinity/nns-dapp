import { governanceMetrics } from "$lib/rest/governance-metrics.rest";
import type { DissolvingNeurons } from "$lib/types/governance-metrics";

const GOVERNANCE_DISSOLVING_NEURONS_E8S_COUNT_KEY =
  "governance_dissolving_neurons_e8s_count";
const GOVERNANCE_NOT_DISSOLVING_NEURONS_E8S_COUNT_KEY =
  "governance_not_dissolving_neurons_e8s_count";

/**
 * Find the total dissolving neurons and not dissolving neurons in governance raw metrics data.
 *
 * Relevant are [key value timestamp]:
 * governance_dissolving_neurons_e8s_count 8128821049483880 1674059025086
 * governance_not_dissolving_neurons_e8s_count 18188426841529904 1674059025086
 *
 * P.S.: We only search for the value and do not consider the timestamp as we refresh the data every minutes anyway.
 */
export const totalDissolvingNeurons =
  async (): Promise<DissolvingNeurons | null> => {
    const metrics = await governanceMetrics();

    if (metrics === null) {
      return null;
    }

    const splits = metrics.replaceAll(/[\n\r]/g, " ").split(" ");

    const findValue = (key: string): string | undefined => {
      const index = splits.findIndex((text: string) => text === key);

      if (index === -1) {
        return undefined;
      }

      return splits[index + 1];
    };

    const totalDissolvingNeurons = findValue(
      GOVERNANCE_DISSOLVING_NEURONS_E8S_COUNT_KEY
    );
    const totalNotDissolvingNeurons = findValue(
      GOVERNANCE_NOT_DISSOLVING_NEURONS_E8S_COUNT_KEY
    );

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
