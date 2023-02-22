import type { SnsSummary } from "$lib/types/sns";
import type { Principal } from "@dfinity/principal";

export type UniverseCanisterIdText = string;
export type UniverseCanisterId = Principal;

export interface Universe {
  canisterId: UniverseCanisterIdText;
  summary?: SnsSummary;
}
