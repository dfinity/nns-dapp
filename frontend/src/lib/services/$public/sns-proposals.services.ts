import { queryProposals } from "$lib/api/sns-governance.api";
import { DEFAULT_SNS_PROPOSALS_PAGE_SIZE } from "$lib/constants/sns-proposals.constants";
import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
import type { Principal } from "@dfinity/principal";
import type { SnsProposalData } from "@dfinity/sns";
import { queryAndUpdate } from "../utils.services";

export const loadSnsProposals = async ({
  rootCanisterId,
}: {
  rootCanisterId: Principal;
}) => {
  return queryAndUpdate<SnsProposalData[], unknown>({
    identityType: "current",
    request: ({ certified, identity }) =>
      queryProposals({
        params: { limit: DEFAULT_SNS_PROPOSALS_PAGE_SIZE },
        identity,
        certified,
        rootCanisterId,
      }),
    onLoad: ({ response: proposals, certified }) => {
      snsProposalsStore.setProposals({
        rootCanisterId,
        proposals,
        certified,
      });
    },
  });
};
