<script lang="ts">
  import FilterModal from "$lib/modals/common/FilterModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { snsFiltersStore } from "$lib/stores/sns-filters.store";
  import type { Filter, SnsProposalTypeFilterData } from "$lib/types/filters";
  import type { Principal } from "@dfinity/principal";
  import { createEventDispatcher } from "svelte";

  export let rootCanisterId: Principal;
  export let filters: Filter<SnsProposalTypeFilterData>[] = [];

  // This is a temporary value to be used inside the modal. It's initialized based on the prop filters;
  let selectedFilters: Array<SnsProposalTypeFilterData> =
    filters.filter((item) => item.checked).map(({ value }) => value) ?? [];
  // This is a temporary value to be used inside the modal
  let filtersValues: Filter<SnsProposalTypeFilterData>[];
  $: filtersValues = filters.map((filter) => ({
    ...filter,
    checked: selectedFilters.includes(filter.value),
  }));

  const dispatch = createEventDispatcher();
  let filter: () => void;
  $: filter = () => {
    snsFiltersStore.setCheckType({
      checkedTypes: selectedFilters,
      rootCanisterId,
    });
    dispatch("nnsClose");
  };

  const onChange = ({
    detail: { filter },
  }: CustomEvent<{
    filter: Filter<SnsProposalTypeFilterData> | undefined;
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

  const clear = () => {
    selectedFilters = [];
  };

  const selectAll = () => {
    selectedFilters = filters.map(({ value }) => value);
  };
</script>

<FilterModal
  on:nnsClose
  on:nnsConfirm={filter}
  on:nnsChange={onChange}
  on:nnsSelectAll={selectAll}
  on:nnsClearSelection={clear}
  filters={filtersValues}
>
  <span slot="title">{$i18n.voting.topics}</span>
</FilterModal>
