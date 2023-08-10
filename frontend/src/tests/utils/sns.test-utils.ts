import { snsQueryStore } from "$lib/stores/sns.store";
import {
  mergeSnsResponses,
  snsResponseFor,
} from "$tests/mocks/sns-response.mock";
import type { Principal } from "@dfinity/principal";
import type { SnsSwapLifecycle } from "@dfinity/sns";

export const setSnsProjects = (
  params: {
    rootCanisterId: Principal;
    lifecycle: SnsSwapLifecycle;
    certified?: boolean;
    restrictedCountries?: string[];
    directParticipantCount?: [] | [bigint];
    projectName?: string;
  }[]
) => {
  const responses = params.map(
    ({
      rootCanisterId,
      lifecycle,
      certified,
      restrictedCountries,
      directParticipantCount,
      projectName,
    }) =>
      snsResponseFor({
        principal: rootCanisterId,
        lifecycle,
        certified,
        restrictedCountries,
        directParticipantCount,
        projectName,
      })
  );
  snsQueryStore.setData(mergeSnsResponses(responses));
};

export const resetSnsProjects = () => {
  snsQueryStore.reset();
};
