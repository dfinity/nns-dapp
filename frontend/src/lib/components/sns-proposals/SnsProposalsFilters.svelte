<script lang="ts">
  import { snsProjectIdSelectedStore } from "$lib/derived/selected-project.derived";
  import SnsFilterStatusModal from "$lib/modals/sns/proposals/SnsFilterStatusModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import {
    snsFiltesStore,
    type ProjectFiltersStoreData,
  } from "$lib/stores/sns-filters.store";
  import type { Principal } from "@dfinity/principal";
  import FiltersWrapper from "../proposals/FiltersWrapper.svelte";
  import FiltersButton from "../ui/FiltersButton.svelte";

  let modal: "topics" | "rewards" | "status" | undefined = undefined;

  let rootCanisterId: Principal;
  $: rootCanisterId = $snsProjectIdSelectedStore;
  let filtersStore: ProjectFiltersStoreData | undefined;
  $: filtersStore = $snsFiltesStore[rootCanisterId.toText()];

  const openFilters = () => {
    modal = "status";
  };

  const close = () => {
    modal = undefined;
  };
</script>

<FiltersWrapper>
  <FiltersButton
    testId="filters-by-status"
    totalFilters={filtersStore?.decisionStatus.length ?? 0}
    activeFilters={filtersStore?.decisionStatus.filter(({ checked }) => checked)
      .length ?? 0}
    on:nnsFilter={openFilters}>{$i18n.voting.status}</FiltersButton
  >
</FiltersWrapper>

{#if modal === "status"}
  <SnsFilterStatusModal
    filters={filtersStore?.decisionStatus}
    {rootCanisterId}
    on:nnsClose={close}
  />
{/if}
