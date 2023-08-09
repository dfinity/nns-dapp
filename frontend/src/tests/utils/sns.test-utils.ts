import { snsQueryStore } from "$lib/stores/sns.store";
import { snsResponseFor } from "$tests/mocks/sns-response.mock";
import type { Principal } from "@dfinity/principal";
import type { SnsSwapLifecycle } from "@dfinity/sns";

export const setSnsProject = ({
  rootCanisterId,
  lifecycle,
  certified = false,
  restrictedCountries,
  directParticipantCount,
  projectName,
}: {
  rootCanisterId: Principal;
  lifecycle: SnsSwapLifecycle;
  certified?: boolean;
  restrictedCountries?: string[];
  directParticipantCount?: [] | [bigint];
  projectName?: string;
}) => {
  const response = snsResponseFor({
    principal: rootCanisterId,
    lifecycle,
    certified,
    restrictedCountries,
    directParticipantCount,
    projectName,
  });
  snsQueryStore.setData(response);
};

export const resetSnsProjects = () => {
  snsQueryStore.reset();
};
