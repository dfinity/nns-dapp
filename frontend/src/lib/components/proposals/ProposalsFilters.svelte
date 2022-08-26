<script lang="ts">
  import type { ProposalsFilterModalProps } from "../../types/proposals";
  import ProposalsFilterModal from "../../modals/proposals/ProposalsFilterModal.svelte";
  import Checkbox from "../ui/Checkbox.svelte";
  import { i18n } from "../../stores/i18n";
  import { ProposalStatus, ProposalRewardStatus, Topic } from "@dfinity/nns";
  import { proposalsFiltersStore } from "../../stores/proposals.store";
  import { enumsExclude } from "../../utils/enum.utils";
  import FiltersButton from "../ui/FiltersButton.svelte";
  import { VOTING_UI } from "../../constants/environment.constants";

  let modalFilters: ProposalsFilterModalProps | undefined = undefined;

  // The voting modal is displayed when filters are set i.e. when filters have to be selected
  const openModal = (filters: ProposalsFilterModalProps) =>
    (modalFilters = filters);

  let topics: Topic[];
  let rewards: ProposalRewardStatus[];
  let status: ProposalStatus[];
  let excludeVotedProposals: boolean;

  $: ({ topics, rewards, status, excludeVotedProposals } =
    $proposalsFiltersStore);

  let totalFiltersTopic = enumsExclude({
    obj: Topic as unknown as Topic,
    values: [Topic.Unspecified],
  }).length;
  let totalFiltersProposalRewardStatus = enumsExclude({
    obj: ProposalRewardStatus as unknown as ProposalRewardStatus,
    values: [ProposalRewardStatus.PROPOSAL_REWARD_STATUS_UNKNOWN],
  }).length;
  let totalFiltersProposalStatus = enumsExclude({
    obj: ProposalStatus as unknown as ProposalStatus,
    values: [ProposalStatus.PROPOSAL_STATUS_UNKNOWN],
  }).length;
</script>

<div class={`filters ${VOTING_UI}`}>
  <FiltersButton
    testId="filters-by-topics"
    totalFilters={totalFiltersTopic}
    activeFilters={topics.length}
    on:nnsFilter={() =>
      openModal({
        category: "topics",
        filters: Topic,
        selectedFilters: topics,
      })}>{$i18n.voting.topics}</FiltersButton
  >

  <FiltersButton
    testId="filters-by-rewards"
    totalFilters={totalFiltersProposalRewardStatus}
    activeFilters={rewards.length}
    on:nnsFilter={() =>
      openModal({
        category: "rewards",
        filters: ProposalRewardStatus,
        selectedFilters: rewards,
      })}>{$i18n.voting.rewards}</FiltersButton
  >

  <FiltersButton
    testId="filters-by-status"
    totalFilters={totalFiltersProposalStatus}
    activeFilters={status.length}
    on:nnsFilter={() =>
      openModal({
        category: "status",
        filters: ProposalStatus,
        selectedFilters: status,
      })}>{$i18n.voting.status}</FiltersButton
  >

  <Checkbox
    inputId="hide-unavailable-proposals"
    checked={excludeVotedProposals}
    on:nnsChange={() => proposalsFiltersStore.toggleExcludeVotedProposals()}
    text="block"
    selector="hide-unavailable-proposals"
    >{$i18n.voting.hide_unavailable_proposals}</Checkbox
  >
</div>

<ProposalsFilterModal
  props={modalFilters}
  on:nnsClose={() => (modalFilters = undefined)}
/>

<style lang="scss">
  .filters {
    display: flex;
    flex-wrap: wrap;
    padding: 0 0 var(--padding-3x);

    // TODO(L2-965): delete legacy style
    &.legacy {
      padding: var(--padding) 0;
    }

    --select-flex-direction: row-reverse;

    :global(button) {
      margin: var(--padding) var(--padding) 0 0;
    }

    > :global(div.checkbox) {
      width: fit-content;
      padding: var(--padding) calc(0.75 * var(--padding));
      margin: var(--padding) 0 0;
    }

    > :global(div.checkbox label) {
      width: 100%;
    }

    > :global(div.checkbox input) {
      margin-right: var(--padding);
    }
  }

  :global(div.hide-unavailable-proposals) {
    --select-font-size: var(--font-size-small);
  }

  :global(section > div.checkbox) {
    margin: 0 0 var(--padding);
  }
</style>
