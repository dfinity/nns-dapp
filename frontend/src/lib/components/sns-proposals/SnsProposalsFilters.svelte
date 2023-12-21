<script lang="ts">
  import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import SnsFilterStatusModal from "$lib/modals/sns/proposals/SnsFilterStatusModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import {
    snsFiltersStore,
    type ProjectFiltersStoreData,
  } from "$lib/stores/sns-filters.store";
  import type { Principal } from "@dfinity/principal";
  import FiltersWrapper from "../proposals/FiltersWrapper.svelte";
  import FiltersButton from "../ui/FiltersButton.svelte";
  import SnsFilterRewardsModal from "$lib/modals/sns/proposals/SnsFilterRewardsModal.svelte";
  import SnsFilterTypesModal from "$lib/modals/sns/proposals/SnsFilterTypesModal.svelte";
  import type { SnsNervousSystemFunction } from "@dfinity/sns";
  import { nonNullish } from "@dfinity/utils";
  import { generateSnsProposalTypeFilterData } from "$lib/utils/sns-proposals.utils";

  export let nsFunctions: SnsNervousSystemFunction[] | undefined;

  let modal: "types" | "rewards" | "status" | undefined = undefined;

  let rootCanisterId: Principal;
  $: rootCanisterId = $selectedUniverseIdStore;
  let filtersStore: ProjectFiltersStoreData | undefined;
  $: filtersStore = $snsFiltersStore[rootCanisterId.toText()];

  $: if (nonNullish(nsFunctions)) {
    // Always update type filters in case of backend changes
    snsFiltersStore.setTypes({
      rootCanisterId,
      types: generateSnsProposalTypeFilterData({
        nsFunctions,
        typesFilterState: filtersStore?.types ?? [],
      }),
    });
    filtersStore = $snsFiltersStore[rootCanisterId.toText()];
  }

  const openFilters = (filtersModal: "types" | "rewards" | "status") => {
    modal = filtersModal;
  };

  const close = () => {
    modal = undefined;
  };
</script>

<FiltersWrapper>
  <FiltersButton
    testId="filters-by-types"
    totalFilters={filtersStore?.types.length ?? 0}
    activeFilters={filtersStore?.types.filter(({ checked }) => checked)
      .length ?? 0}
    on:nnsFilter={() => openFilters("types")}
  >
    {$i18n.voting.topics}
  </FiltersButton>
  <FiltersButton
    testId="filters-by-rewards"
    totalFilters={filtersStore?.rewardStatus.length ?? 0}
    activeFilters={filtersStore?.rewardStatus.filter(({ checked }) => checked)
      .length ?? 0}
    on:nnsFilter={() => openFilters("rewards")}
    >{$i18n.voting.rewards}</FiltersButton
  >
  <FiltersButton
    testId="filters-by-status"
    totalFilters={filtersStore?.decisionStatus.length ?? 0}
    activeFilters={filtersStore?.decisionStatus.filter(({ checked }) => checked)
      .length ?? 0}
    on:nnsFilter={() => openFilters("status")}
    >{$i18n.voting.status}</FiltersButton
  >
</FiltersWrapper>

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

{#if modal === "rewards"}
  <SnsFilterRewardsModal
    filters={filtersStore?.rewardStatus}
    {rootCanisterId}
    on:nnsClose={close}
  />
{/if}
