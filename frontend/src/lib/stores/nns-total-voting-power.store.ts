import { writable } from "svelte/store";

export const nnsTotalVotingPower = writable<bigint | undefined>(undefined);
