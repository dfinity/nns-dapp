import type { BasisPoints } from "$lib/types/proposals";
import { ProposalStatus, Topic } from "@dfinity/nns";

export const DEFAULT_PROPOSALS_FILTERS: {
  topics: Topic[];
  status: ProposalStatus[];
} = {
  topics: [],
  status: [],
};

export const DEPRECATED_TOPICS = [Topic.SnsDecentralizationSale];

export const PROPOSER_ID_DISPLAY_SPLIT_LENGTH = 5;

/**
 * 3 % - default value for nns and sns proposals.
 * Reference: https://github.com/dfinity/ic/blob/dc2c20b26eaddb459698e4f9a30e521c21fb3d6e/rs/sns/governance/src/types.rs#L378
 */
export const MINIMUM_YES_PROPORTION_OF_TOTAL_VOTING_POWER: BasisPoints = 300n;
/**
 * 50 % - default value for nns and sns proposals.
 * Reference: https://github.com/dfinity/ic/blob/dc2c20b26eaddb459698e4f9a30e521c21fb3d6e/rs/sns/governance/src/types.rs#L385
 */
export const MINIMUM_YES_PROPORTION_OF_EXERCISED_VOTING_POWER: BasisPoints =
  5_000n;
