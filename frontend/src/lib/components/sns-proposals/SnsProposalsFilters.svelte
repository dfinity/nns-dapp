<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import ActionableProposalsSegment from "$lib/components/proposals/ActionableProposalsSegment.svelte";
  import FiltersWrapper from "$lib/components/proposals/FiltersWrapper.svelte";
  import FiltersButton from "$lib/components/ui/FiltersButton.svelte";
  import { actionableProposalsActiveStore } from "$lib/derived/actionable-proposals.derived";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { snsTopicsStore } from "$lib/derived/sns-topics.derived";
  import SnsFilterStatusModal from "$lib/modals/sns/proposals/SnsFilterStatusModal.svelte";
  import SnsFilterTopicsModal from "$lib/modals/sns/proposals/SnsFilterTopicsModal.svelte";
  import SnsFilterTypesModal from "$lib/modals/sns/proposals/SnsFilterTypesModal.svelte";
  import { ENABLE_SNS_TOPICS } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import {
    snsFiltersStore,
    type ProjectFiltersStoreData,
  } from "$lib/stores/sns-filters.store";

  type Filters = "types" | "status" | "topics";

  let modal = $state<Filters | undefined>();

  const rootCanisterId = $derived($selectedUniverseIdStore);
  const filtersStore = $derived<ProjectFiltersStoreData | undefined>(
    $snsFiltersStore[rootCanisterId.toText()]
  );
  const openFilters = (filtersModal: Filters) => (modal = filtersModal);
  const closeModal = () => (modal = undefined);

  const isFilterByTopicVisible = $derived(
    $ENABLE_SNS_TOPICS && $snsTopicsStore[rootCanisterId.toText()]
  );
</script>

<TestIdWrapper testId="sns-proposals-filters-component">
  <div class="proposal-filters">
    {#if $authSignedInStore}
      <ActionableProposalsSegment />
    {/if}

    {#if !$actionableProposalsActiveStore}
      <FiltersWrapper>
        {#if isFilterByTopicVisible}
          <FiltersButton
            testId="filters-by-topics"
            totalFilters={filtersStore?.topics.length ?? 0}
            activeFilters={filtersStore?.topics.filter(({ checked }) => checked)
              .length ?? 0}
            on:nnsFilter={() => openFilters("topics")}
          >
            {$i18n.voting.topics}
          </FiltersButton>
        {:else}
          <FiltersButton
            testId="filters-by-types"
            totalFilters={filtersStore?.types.length ?? 0}
            activeFilters={filtersStore?.types.filter(({ checked }) => checked)
              .length ?? 0}
            on:nnsFilter={() => openFilters("types")}
          >
            {$i18n.voting.types}
          </FiltersButton>
        {/if}
        <FiltersButton
          testId="filters-by-status"
          totalFilters={filtersStore?.decisionStatus.length ?? 0}
          activeFilters={filtersStore?.decisionStatus.filter(
            ({ checked }) => checked
          ).length ?? 0}
          on:nnsFilter={() => openFilters("status")}
          >{$i18n.voting.status}</FiltersButton
        >
      </FiltersWrapper>
    {/if}
  </div>

  {#if modal === "types"}
    <SnsFilterTypesModal
      filters={filtersStore?.types}
      {rootCanisterId}
      {closeModal}
    />
  {/if}

  {#if modal === "topics"}
    <SnsFilterTopicsModal
      filters={filtersStore?.topics}
      {closeModal}
      {rootCanisterId}
    />
  {/if}

  {#if modal === "status"}
    <SnsFilterStatusModal
      filters={filtersStore?.decisionStatus}
      {rootCanisterId}
      {closeModal}
    />
  {/if}
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
