import { queryProposals } from "$lib/api/sns-governance.api";
import { DEFAULT_SNS_PROPOSALS_PAGE_SIZE } from "$lib/constants/sns-proposals.constants";
import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Principal } from "@dfinity/principal";
import type { SnsProposalData, SnsProposalId } from "@dfinity/sns";
import { queryAndUpdate } from "../utils.services";

export const loadSnsProposals = async ({
  rootCanisterId,
  beforeProposalId,
}: {
  rootCanisterId: Principal;
  beforeProposalId?: SnsProposalId;
}) => {
  return queryAndUpdate<SnsProposalData[], unknown>({
    identityType: "current",
    request: ({ certified, identity }) =>
      queryProposals({
        params: {
          limit: DEFAULT_SNS_PROPOSALS_PAGE_SIZE,
          beforeProposal: beforeProposalId,
        },
        identity,
        certified,
        rootCanisterId,
      }),
    onLoad: ({ response: proposals, certified }) => {
      snsProposalsStore.addProposals({
        rootCanisterId,
        proposals,
        certified,
        completed: proposals.length < DEFAULT_SNS_PROPOSALS_PAGE_SIZE,
      });
    },
    onError: (err) => {
      toastsError({
        labelKey: "error.list_proposals",
        err,
      });
    },
  });
};
