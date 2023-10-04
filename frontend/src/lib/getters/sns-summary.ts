import type { CountryCode } from "$lib/types/location";
import type { SnsSummary } from "$lib/types/sns";
import { fromNullable } from "@dfinity/utils";

export const getDeniedCountries = (_summary: SnsSummary): CountryCode[] =>
  fromNullable(fromNullable(_summary.swap.init)?.restricted_countries ?? [])
    ?.iso_codes ?? [];

export const getConditionsToAccept = (
  summary: SnsSummary
): string | undefined =>
  fromNullable(fromNullable(summary.swap.init)?.confirmation_text || []);

// TODO: https://dfinity.atlassian.net/browse/GIX-1909 use nf participation field when present
export const getNeuronsFundParticipation = (
  _summary: SnsSummary
): bigint | undefined => undefined;

// TODO: https://dfinity.atlassian.net/browse/GIX-1936 use min direct field when present
export const getMinDirectParticipation = (
  _summary: SnsSummary
): bigint | undefined => undefined;

// TODO: https://dfinity.atlassian.net/browse/GIX-1936 use min direct field when present
export const getMaxDirectParticipation = (
  _summary: SnsSummary
): bigint | undefined => undefined;
