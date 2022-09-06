import { derived, type Readable } from "svelte/store";
import type { ProposalsStore } from "../stores/proposals.store";
import { proposalsStore } from "../stores/proposals.store";

/**
 * A derived store of the proposals store that ensure the proposals are sorted by their proposal ids descendant (as provided back by the backend)
 *
 * ⚠️ Proposals need to be sorted ⚠️
 *
 * Listing next proposals happens based on the last proposal id that finds place in the store.
 * If after a search, the id of the last element would remain the same as the id that has been just searched, we might trigger a next search with the exact same id.
 * Therefore, there would be a risk of endless loop.
 *
 */
export const sortedProposals: Readable<ProposalsStore> = derived(
  [proposalsStore],
  ([{ proposals, certified }]) => ({
    proposals: proposals.sort(({ id: proposalIdA }, { id: proposalIdB }) =>
      Number((proposalIdB ?? BigInt(0)) - (proposalIdA ?? BigInt(0)))
    ),
    certified,
  })
);
