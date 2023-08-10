import { snsQueryStore } from "$lib/stores/sns.store";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { createQueryMetadataResponse } from "$tests/mocks/sns-projects.mock";
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
    tokenMetadata?: Partial<Pick<IcrcTokenMetadata, "name" | "symbol">>;
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
      tokenMetadata,
    }) =>
      snsResponseFor({
        principal: rootCanisterId,
        lifecycle,
        certified,
        restrictedCountries,
        directParticipantCount,
        projectName,
        tokenMetadata: createQueryMetadataResponse(tokenMetadata),
      })
  );
  snsQueryStore.setData(mergeSnsResponses(responses));
};

export const resetSnsProjects = () => {
  snsQueryStore.reset();
};
