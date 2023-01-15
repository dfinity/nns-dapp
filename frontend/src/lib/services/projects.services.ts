import { loadSnsBalance } from "$lib/services/sns-accounts-balance.services";
import type { SnsSummary } from "$lib/types/sns";

export const uncertifiedLoadSnsBalances = ({
  summaries,
}: {
  summaries: SnsSummary[];
}): Promise<void[]> =>
  Promise.all(
    (
      summaries.filter(
        ({ metadataCertified }) => metadataCertified === false
      ) ?? []
    ).map(({ rootCanisterId }) =>
      loadSnsBalance({
        rootCanisterId,
        strategy: "query",
      })
    )
  );
