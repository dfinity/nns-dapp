import type { SnsSummary } from "$lib/types/sns";

export interface Universe {
  canisterId: string;
  summary?: SnsSummary;
}
