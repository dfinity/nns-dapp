import type {
  SnsBallot,
  SnsProposalData as SnsProposalDataRaw,
} from "@dfinity/sns";

export interface SnsProposalData extends Omit<SnsProposalDataRaw, "ballots"> {
  // let the ballots be optional to avoid having confusing empty arrays from the outdated sns governance canister
  ballots?: Array<[string, SnsBallot]>;
}

export interface SnsProposalDataWithBallots
  extends Omit<SnsProposalData, "ballots"> {
  ballots: Array<[string, SnsBallot]>;
}

export const isSnsProposalDataWithBallots = (
  value: SnsProposalData
): value is SnsProposalDataWithBallots => Array.isArray(value?.ballots);
