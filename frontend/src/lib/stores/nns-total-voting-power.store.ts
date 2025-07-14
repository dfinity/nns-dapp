import { writable } from "svelte/store";

export const nnsTotalVotingPowerStore = writable<bigint | undefined>(undefined);
