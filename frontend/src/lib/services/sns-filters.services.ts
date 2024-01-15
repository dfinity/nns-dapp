import { i18n } from "$lib/stores/i18n";
import { snsFiltersStore } from "$lib/stores/sns-filters.store";
import type { Filter } from "$lib/types/filters";
import { enumValues } from "$lib/utils/enum.utils";
import { generateSnsProposalTypesFilterData } from "$lib/utils/sns-proposals.utils";
import type { Principal } from "@dfinity/principal";
import {
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
  type SnsNervousSystemFunction,
} from "@dfinity/sns";
import { isNullish } from "@dfinity/utils";
import { get } from "svelte/store";

const defaultFiltersProjectData = {
  types: [],
  rewardStatus: [],
  decisionStatus: [],
};

  // Load decision status, these are harcoded based on enum values
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

// Load reward status, these are hardcoded based on enum values
const loadRewardStatusFilters = (rootCanisterId: Principal) => {
  const i18nKeys = get(i18n);
  const mapRewardStatus = (
    value: SnsProposalRewardStatus
  ): Filter<SnsProposalRewardStatus> => {
    return {
      id: String(value),
      value,
      name: i18nKeys.sns_rewards_status[value] ?? i18nKeys.core.unspecified,
      checked: defaultFiltersProjectData.rewardStatus.some(
        ({ checked, id }) => checked && id === String(value)
      ),
    };
  };
  const rewardStatus = enumValues(SnsProposalRewardStatus)
    .filter(
      (status) =>
        SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_UNSPECIFIED !== status
    )
    .map(mapRewardStatus);

  snsFiltersStore.setRewardStatus({
    rootCanisterId,
    rewardStatus,
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
    loadRewardStatusFilters(rootCanisterId);
  }

  // It's safe to reload types filters as the `loadTypesFilters` respects user selection,
  // and it needs to be reloaded to get nsFunctions update.
  loadTypesFilters({ rootCanisterId, nsFunctions, snsName });
};
