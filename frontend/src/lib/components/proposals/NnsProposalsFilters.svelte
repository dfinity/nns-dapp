<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import ActionableProposalsSegment from "$lib/components/proposals/ActionableProposalsSegment.svelte";
  import FiltersWrapper from "$lib/components/proposals/FiltersWrapper.svelte";
  import FiltersButton from "$lib/components/ui/FiltersButton.svelte";
  import { DEPRECATED_TOPICS } from "$lib/constants/proposals.constants";
  import { actionableProposalsActiveStore } from "$lib/derived/actionable-proposals.derived";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import NnsProposalsFilterModal from "$lib/modals/proposals/NnsProposalsFilterModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { proposalsFiltersStore } from "$lib/stores/proposals.store";
  import type { ProposalsFilterModalProps } from "$lib/types/proposals";
  import { enumsExclude } from "$lib/utils/enum.utils";
  import { ProposalStatus, Topic } from "@dfinity/nns";

  let modalFilters: ProposalsFilterModalProps | undefined = undefined;

  // The voting modal is displayed when filters are set i.e. when filters have to be selected
  const openModal = (filters: ProposalsFilterModalProps) =>
    (modalFilters = filters);

  let topics: Topic[];
  let status: ProposalStatus[];

  $: ({ topics, status } = $proposalsFiltersStore);

  let totalFiltersTopic = enumsExclude({
    obj: Topic as unknown as Topic,
    values: [Topic.Unspecified, Topic.SnsDecentralizationSale],
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

<TestIdWrapper testId="nns-proposals-filters-component">
  <div class="proposal-filters">
    {#if $authSignedInStore}
      <ActionableProposalsSegment />
    {/if}

    {#if !$actionableProposalsActiveStore}
      <FiltersWrapper>
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
      </FiltersWrapper>
    {/if}
  </div>

  <NnsProposalsFilterModal
    props={modalFilters}
    on:nnsClose={() => (modalFilters = undefined)}
  />
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .proposal-filters {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
    margin-bottom: var(--padding-3x);

    @include media.min-width(medium) {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
    }
  }
</style>
