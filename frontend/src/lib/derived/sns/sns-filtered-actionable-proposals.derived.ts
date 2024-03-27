import {
  actionableSnsProposalsStore,
  type ActionableSnsProposalsStoreData,
} from "$lib/stores/actionable-sns-proposals.store";

import { snsFilteredProposalsStore } from "$lib/derived/sns/sns-filtered-proposals.derived";
import type { SnsProposalsStoreData } from "$lib/stores/sns-proposals.store";
import { snsProposalId } from "$lib/utils/sns-proposals.utils";
import { mapEntries } from "$lib/utils/utils";
import type { SnsProposalData } from "@dfinity/sns";
import { derived, type Readable } from "svelte/store";

export type SnsProposalActionableData = SnsProposalData & {
  isActionable: boolean | undefined;
};

export interface SnsFilteredActionableProposalsStoreData {
  [rootCanisterId: string]: SnsProposalActionableData[];
}

export const snsFilteredActionableProposalsStore = derived<
  [Readable<SnsProposalsStoreData>, Readable<ActionableSnsProposalsStoreData>],
  SnsFilteredActionableProposalsStoreData
>(
  [snsFilteredProposalsStore, actionableSnsProposalsStore],
  ([proposalsStore, actionableProposalsStore]) => {
    return mapEntries({
      obj: proposalsStore,
      mapFn: ([rootCanisterIdText, filteredProposals]) => {
        const actionableProposals =
          actionableProposalsStore[rootCanisterIdText];
        const proposals = filteredProposals.proposals.map((proposal) => ({
          ...proposal,
          // append `isActionable`
          isActionable: actionableProposals?.proposals.some(
            (actionableProposal) =>
              snsProposalId(actionableProposal) === snsProposalId(proposal)
          ),
        }));
        return [rootCanisterIdText, proposals];
      },
    });
  }
);
