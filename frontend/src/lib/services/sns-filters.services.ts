import { i18n } from "$lib/stores/i18n";
import { snsFiltesStore } from "$lib/stores/sns-filters.store";
import { enumValues } from "$lib/utils/enum.utils";
import type { Principal } from "@dfinity/principal";
import { SnsProposalDecisionStatus } from "@dfinity/sns";
import { get } from "svelte/store";

// TODO: Set default filters
export const loadSnsFilters = async (rootCanisterId: Principal) => {
  const i18nKeys = get(i18n);
  const filtersProjectData = get(snsFiltesStore)[rootCanisterId.toText()] ?? {
    topics: [],
    rewardStatus: [],
    decisionStatus: [],
  };
  const mapDecisionStatus = (value: SnsProposalDecisionStatus) => {
    return {
      id: String(value),
      value,
      name: i18nKeys.sns_status[value] ?? i18nKeys.core.unspecified,
      checked: filtersProjectData.decisionStatus.some(
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
  snsFiltesStore.setDecisionStatus({
    rootCanisterId,
    decisionStatus,
  });
};
