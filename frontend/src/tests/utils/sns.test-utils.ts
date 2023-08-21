import { snsQueryStore } from "$lib/stores/sns.store";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import {
  createQueryMetadataResponse,
  principal,
} from "$tests/mocks/sns-projects.mock";
import {
  mergeSnsResponses,
  snsResponseFor,
} from "$tests/mocks/sns-response.mock";
import type { Principal } from "@dfinity/principal";
import type { SnsSwapLifecycle } from "@dfinity/sns";
import { isNullish } from "@dfinity/utils";

export const setSnsProjects = (
  params: {
    rootCanisterId?: Principal;
    lifecycle: SnsSwapLifecycle;
    certified?: boolean;
    restrictedCountries?: string[];
    directParticipantCount?: [] | [bigint];
    projectName?: string;
    tokenMetadata?: Partial<IcrcTokenMetadata>;
  }[]
) => {
  if (
    params.filter(({ rootCanisterId }) => isNullish(rootCanisterId)).length > 5
  ) {
    throw new Error("Too many projects without canister id.");
  }
  const responses = params.map(
    (
      {
        rootCanisterId,
        lifecycle,
        certified,
        restrictedCountries,
        directParticipantCount,
        projectName,
        tokenMetadata,
      },
      index
    ) =>
      snsResponseFor({
        principal: rootCanisterId ?? principal(index),
        lifecycle,
        certified,
        restrictedCountries,
        directParticipantCount,
        projectName,
        tokenMetadata:
          tokenMetadata && createQueryMetadataResponse(tokenMetadata),
      })
  );
  snsQueryStore.setData(mergeSnsResponses(responses));
};

export const resetSnsProjects = () => {
  snsQueryStore.reset();
};
