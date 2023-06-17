import { i18n } from "$lib/stores/i18n";
import { snsFiltersStore } from "$lib/stores/sns-filters.store";
import type { Filter } from "$lib/types/filters";
import { enumValues } from "$lib/utils/enum.utils";
import type { Principal } from "@dfinity/principal";
import {
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
} from "@dfinity/sns";
import { nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";

// TODO: Set default filters
export const loadSnsFilters = async (rootCanisterId: Principal) => {
  const filtersProjectStoreData = get(snsFiltersStore)[rootCanisterId.toText()];
  if (nonNullish(filtersProjectStoreData)) {
    return;
  }
  const i18nKeys = get(i18n);
  const defaultFiltersProjectData = {
    topics: [],
    rewardStatus: [],
    decisionStatus: [],
  };
  // Load decision status, these are harcoded based on enum values
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

  // Load reward status, these are harcoded based on enum values
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
