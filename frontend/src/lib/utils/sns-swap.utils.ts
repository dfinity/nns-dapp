import { fromNullable, nonNullish } from "@dfinity/utils";
import type { SnsSwapDid } from "@icp-sdk/canisters/sns";

/**
 * Returns the number of direct participants of a swap.
 *
 * The value comes from the certified `get_derived_state` call. It is undefined
 * when the swap canister does not report the field.
 */
export const swapSaleBuyerCount = ({
  derivedState: { direct_participant_count },
}: {
  derivedState: SnsSwapDid.DerivedState;
}): number | undefined => {
  const count = fromNullable(direct_participant_count);
  return nonNullish(count) ? Number(count) : undefined;
};
