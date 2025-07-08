import { writable } from "svelte/store";

export const nnsTotalVotingPower = writable<bigint>(0n);
