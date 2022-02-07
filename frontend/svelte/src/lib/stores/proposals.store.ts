import type { ProposalInfo } from "@dfinity/nns";
import { writable } from "svelte/store";

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
