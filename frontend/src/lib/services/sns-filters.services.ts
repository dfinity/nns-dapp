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
    const i18nKeys = get(i18n);
    const defaultFiltersProjectData = {
      // Because types are based on the nsFunctions, they will be updated after initialization
      types: [],
      rewardStatus: [],
      decisionStatus: [],
    };

    snsFiltersStore.setTypes({
      rootCanisterId,
      types: defaultFiltersProjectData.types,
    });

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
  }

  // update types filter
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
