<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import ActionableProposalsSegment from "$lib/components/proposals/ActionableProposalsSegment.svelte";
  import { actionableProposalsActiveStore } from "$lib/derived/actionable-proposals.derived";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import SnsFilterStatusModal from "$lib/modals/sns/proposals/SnsFilterStatusModal.svelte";
  import SnsFilterTypesModal from "$lib/modals/sns/proposals/SnsFilterTypesModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import {
    snsFiltersStore,
    type ProjectFiltersStoreData,
  } from "$lib/stores/sns-filters.store";
  import FiltersWrapper from "$lib/components/proposals/FiltersWrapper.svelte";
  import FiltersButton from "$lib/components/ui/FiltersButton.svelte";
  import type { Principal } from "@dfinity/principal";

  let modal: "types" | "status" | undefined = undefined;

  let rootCanisterId: Principal;
  $: rootCanisterId = $selectedUniverseIdStore;
  let filtersStore: ProjectFiltersStoreData | undefined;
  $: filtersStore = $snsFiltersStore[rootCanisterId.toText()];

  const openFilters = (filtersModal: "types" | "status") => {
    modal = filtersModal;
  };

  const close = () => {
    modal = undefined;
  };
</script>

<TestIdWrapper testId="sns-proposals-filters-component">
  <div class="proposal-filters">
    {#if $authSignedInStore}
      <ActionableProposalsSegment />
    {/if}

    {#if !$actionableProposalsActiveStore}
      <FiltersWrapper>
        <FiltersButton
          testId="filters-by-types"
          totalFilters={filtersStore?.types.length ?? 0}
          activeFilters={filtersStore?.types.filter(({ checked }) => checked)
            .length ?? 0}
          on:nnsFilter={() => openFilters("types")}
        >
          {$i18n.voting.types}
        </FiltersButton>
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
      on:nnsClose={close}
    />
  {/if}

  {#if modal === "status"}
    <SnsFilterStatusModal
      filters={filtersStore?.decisionStatus}
      {rootCanisterId}
      on:nnsClose={close}
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
