import type { CountryCode } from "$lib/types/location";
import type { SnsSummary } from "$lib/types/sns";
import type { ProposalId } from "@dfinity/nns";
import { fromNullable } from "@dfinity/utils";

export const getDeniedCountries = (_summary: SnsSummary): CountryCode[] =>
  fromNullable(fromNullable(_summary.swap.init)?.restricted_countries ?? [])
    ?.iso_codes ?? [];

export const getConditionsToAccept = (
  summary: SnsSummary
): string | undefined =>
  fromNullable(fromNullable(summary.swap.init)?.confirmation_text || []);

export const getNeuronsFundParticipation = ({
  derived,
}: SnsSummary): bigint | undefined =>
  fromNullable(derived.neurons_fund_participation_icp_e8s);

export const getMinDirectParticipation = ({
  init,
}: SnsSummary): bigint | undefined =>
  fromNullable(init?.min_direct_participation_icp_e8s ?? []);

export const getMaxDirectParticipation = ({
  init,
}: SnsSummary): bigint | undefined =>
  fromNullable(init?.max_direct_participation_icp_e8s ?? []);

export const getMaxNeuronsFundParticipation = ({
  init,
}: SnsSummary): bigint | undefined =>
  fromNullable(
    fromNullable(init?.neurons_fund_participation_constraints ?? [])
      ?.max_neurons_fund_participation_icp_e8s ?? []
  );

// TODO: Hardcode the project ids for initial projects
export const getProjectProposal = (
  summary: SnsSummary
): ProposalId | undefined => fromNullable(summary.init?.nns_proposal_id ?? []);
