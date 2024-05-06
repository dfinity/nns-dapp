import { i18n } from "$lib/stores/i18n";
import { snsFiltersStore } from "$lib/stores/sns-filters.store";
import type { Filter } from "$lib/types/filters";
import { enumValues } from "$lib/utils/enum.utils";
import { generateSnsProposalTypesFilterData } from "$lib/utils/sns-proposals.utils";
import type { Principal } from "@dfinity/principal";
import {
  SnsProposalDecisionStatus,
  type SnsNervousSystemFunction,
} from "@dfinity/sns";
import { isNullish } from "@dfinity/utils";
import { get } from "svelte/store";

const defaultFiltersProjectData = {
  types: [],
  decisionStatus: [],
};

// Load decision status, these are hardcoded based on enum values
const loadDecisionStatusFilters = (rootCanisterId: Principal) => {
  const i18nKeys = get(i18n);
  const mapDecisionStatus = (
    value: SnsProposalDecisionStatus
  ): Filter<SnsProposalDecisionStatus> => {
    return {
      id: String(value),
      value,
      name: i18nKeys.sns_status[value] ?? i18nKeys.core.unspecified,
      checked: defaultFiltersProjectData.decisionStatus.some(
        ({ checked, id }) => checked && id === String(value)
      ),
    };
  };
  const decisionStatus = enumValues(SnsProposalDecisionStatus)
    .filter(
      (status) =>
        SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_UNSPECIFIED !==
        status
    )
    .map(mapDecisionStatus);

  snsFiltersStore.setDecisionStatus({
    rootCanisterId,
    decisionStatus,
  });
};

const loadTypesFilters = ({
  rootCanisterId,
  nsFunctions,
  snsName,
}: {
  rootCanisterId: Principal;
  nsFunctions: SnsNervousSystemFunction[];
  snsName: string;
}) => {
  const currentTypesFilterData =
    get(snsFiltersStore)?.[rootCanisterId.toText()]?.types ?? [];
  const updatedTypesFilterData = generateSnsProposalTypesFilterData({
    nsFunctions,
    typesFilterState: currentTypesFilterData,
    snsName,
  });

  snsFiltersStore.setTypes({
    rootCanisterId,
    types: updatedTypesFilterData,
  });
};

// TODO: Set default filters
export const loadSnsFilters = async ({
  rootCanisterId,
  nsFunctions,
  snsName,
}: {
  rootCanisterId: Principal;
  nsFunctions: SnsNervousSystemFunction[];
  snsName: string;
}) => {
  const filtersProjectStoreData = get(snsFiltersStore)[rootCanisterId.toText()];

  // Set initial filters state
  if (isNullish(filtersProjectStoreData)) {
    snsFiltersStore.setTypes({
      rootCanisterId,
      types: defaultFiltersProjectData.types,
    });

    // Do not re-initialise decision status and reward status to not override user selection.
    // We assume that the enums are not going to change.
    loadDecisionStatusFilters(rootCanisterId);
  }

  // It's safe to reload types filters as the `loadTypesFilters` respects user selection,
  // and it needs to be reloaded to get nsFunctions update.
  loadTypesFilters({ rootCanisterId, nsFunctions, snsName });
};
