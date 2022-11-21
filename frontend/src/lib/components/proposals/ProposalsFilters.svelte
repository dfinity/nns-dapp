<script lang="ts">
  import type { ProposalsFilterModalProps } from "$lib/types/proposals";
  import ProposalsFilterModal from "$lib/modals/proposals/ProposalsFilterModal.svelte";
  import { Checkbox } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { ProposalStatus, ProposalRewardStatus, Topic } from "@dfinity/nns";
  import { proposalsFiltersStore } from "$lib/stores/proposals.store";
  import { enumsExclude } from "$lib/utils/enum.utils";
  import FiltersButton from "$lib/components/ui/FiltersButton.svelte";
  import { DEPRECATED_TOPICS } from "$lib/constants/proposals.constants";
  import SignedInOnly from "$lib/components/common/SignedInOnly.svelte";

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
    values: [Topic.Unspecified, Topic.SnsDecentralizationSale],
  }).length;
  let totalFiltersProposalRewardStatus = enumsExclude({
    obj: ProposalRewardStatus as unknown as ProposalRewardStatus,
    values: [ProposalRewardStatus.Unknown],
  }).length;
  let totalFiltersProposalStatus = enumsExclude({
    obj: ProposalStatus as unknown as ProposalStatus,
    values: [ProposalStatus.Unknown],
  }).length;

  let activeFiltersCount: number;
  $: activeFiltersCount = topics.filter(
    (topic) => !DEPRECATED_TOPICS.includes(topic)
  ).length;
</script>

<div class="filters">
  <FiltersButton
    testId="filters-by-topics"
    totalFilters={totalFiltersTopic}
    activeFilters={activeFiltersCount}
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

  <SignedInOnly>
    <Checkbox
      inputId="hide-unavailable-proposals"
      checked={excludeVotedProposals}
      on:nnsChange={() => proposalsFiltersStore.toggleExcludeVotedProposals()}
      text="block">{$i18n.voting.hide_unavailable_proposals}</Checkbox
    >
  </SignedInOnly>
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

    --checkbox-flex-direction: row-reverse;
    --checkbox-font-size: var(--font-size-small);

    :global(button) {
      margin: var(--padding) var(--padding) 0 0;
    }

    > :global(div.checkbox) {
      width: fit-content;
      padding: var(--padding) calc(0.75 * var(--padding));
      margin: var(--padding) 0 0;
    }
  }

  :global(section > div.checkbox) {
    margin: 0 0 var(--padding);
  }
</style>
