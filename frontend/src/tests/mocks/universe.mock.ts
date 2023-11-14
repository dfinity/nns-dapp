import type { SnsSummary } from "$lib/types/sns";
import type { Universe } from "$lib/types/universe";

export const createUniverseMock = (summary: SnsSummary): Universe => ({
  canisterId: summary.rootCanisterId.toText(),
  summary,
  title: summary.metadata.name,
  logo: summary.metadata.logo,
});
