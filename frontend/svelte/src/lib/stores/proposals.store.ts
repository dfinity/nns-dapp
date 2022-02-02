import { writable } from "svelte/store";
import type { ProposalInfo } from "@dfinity/nns";

const initProposalsStore = () => {
  const { subscribe, update } = writable<ProposalInfo[]>([]);

  return {
    subscribe,

    push(proposals: ProposalInfo[]) {
      update((proposalInfos: ProposalInfo[]) => [
        ...proposalInfos,
        ...proposals,
      ]);
    },
  };
};

export const proposalsStore = initProposalsStore();
