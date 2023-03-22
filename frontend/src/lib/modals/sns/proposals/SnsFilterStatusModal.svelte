<script lang="ts">
  import FilterModal from "$lib/modals/common/FilterModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { snsFiltersStore } from "$lib/stores/sns-filters.store";
  import type { Filter } from "$lib/types/filters";
  import type { Principal } from "@dfinity/principal";
  import type { SnsProposalDecisionStatus } from "@dfinity/sns";
  import { createEventDispatcher } from "svelte";

  export let rootCanisterId: Principal;
  export let filters: Filter<SnsProposalDecisionStatus>[] = [];

  // This is a temporary value to be used inside the modal. It's initialized based on the prop filters;
  let selectedFilters: SnsProposalDecisionStatus[] =
    filters.filter(({ checked }) => checked).map(({ value }) => value) ?? [];
  // This is a temporary value to be used inside the modal
  let filtersValues: Filter<SnsProposalDecisionStatus>[];
  $: filtersValues = filters.map((filter) => ({
    ...filter,
    checked: selectedFilters.includes(filter.value),
  }));

  const dispatch = createEventDispatcher();
  let filter: () => void;
  $: filter = () => {
    snsFiltersStore.setCheckDecisionStatus({
      checkedDecisionStatus: selectedFilters,
      rootCanisterId,
    });
    dispatch("nnsClose");
  };

  const onChange = ({
    detail: { filter },
  }: CustomEvent<{
    filter: Filter<SnsProposalDecisionStatus> | undefined;
  }>) => {
    if (filter === undefined) {
      return;
    }
    selectedFilters = [
      ...selectedFilters.filter((status) => status !== filter?.value),
      // Toggle the checked value
      ...(filter.checked ? [] : [filter.value]),
    ];
  };
</script>

<FilterModal
  on:nnsClose
  on:nnsConfirm={filter}
  on:nnsChange={onChange}
  filters={filtersValues}
>
  <span slot="title">{$i18n.voting.status}</span>
</FilterModal>
