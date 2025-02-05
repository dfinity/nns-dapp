<script lang="ts">
  import { DEPRECATED_TOPICS } from "$lib/constants/proposals.constants";
  import FilterModal from "$lib/modals/common/FilterModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { proposalsFiltersStore } from "$lib/stores/proposals.store";
  import type { Filter } from "$lib/types/filters";
  import type {
    ProposalsFilterModalProps,
    ProposalsFilters,
  } from "$lib/types/proposals";
  import { PROPOSAL_FILTER_UNSPECIFIED_VALUE } from "$lib/types/proposals";
  import { enumValues } from "$lib/utils/enum.utils";
  import { keyOf, keyOfOptional } from "$lib/utils/utils";
  import type { ProposalStatus, Topic } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { createAscendingComparator } from "$lib/utils/sort.utils";

  export let props: ProposalsFilterModalProps | undefined;

  let visible: boolean;
  let category: string;
  let i18nKeys: unknown | undefined;
  $: i18nKeys =
    props?.category !== undefined
      ? keyOf({ obj: $i18n, key: props?.category })
      : undefined;
  let filters: ProposalsFilters | undefined;
  let filtersValues: Filter<Topic | ProposalStatus>[];
  let selectedFilters: (Topic | ProposalStatus)[];

  let mapToFilter: (
    value: Topic | ProposalStatus
  ) => Filter<Topic | ProposalStatus>;
  $: mapToFilter = (value: Topic | ProposalStatus) => {
    return {
      id: String(value),
      value,
      name:
        keyOfOptional({
          obj: i18nKeys,
          key: filters?.[value] ?? "",
        }) ?? "Unspecified",
      checked: selectedFilters?.includes(value),
    };
  };

  $: visible = props !== undefined;
  $: category = props?.category ?? "uncategorized";
  $: filters = props?.filters;
  $: filtersValues = filters
    ? enumValues(filters)
        .filter((value) => value !== PROPOSAL_FILTER_UNSPECIFIED_VALUE)
        .filter((value) =>
          category === "topics" ? !DEPRECATED_TOPICS.includes(value) : true
        )
        .map(mapToFilter)
    : [];
  $: selectedFilters = props?.selectedFilters || [];

  const compareByName = createAscendingComparator(
    ({ name }: Filter<Topic | ProposalStatus>) => name
  );
  let sortedFilterValues: Filter<Topic | ProposalStatus>[];
  $: sortedFilterValues =
    category === "topics" ? filtersValues.sort(compareByName) : filtersValues;

  const dispatch = createEventDispatcher();
  const close = () => dispatch("nnsClose", { selectedFilters });

  // Update list of selected filters with filter - i.e. toggle the checked or not checked of the filter that has been clicked
  const applyFilterChange = (filter: Topic | ProposalStatus) =>
    (selectedFilters = selectedFilters.includes(filter)
      ? selectedFilters.filter(
          (activeTopic: Topic | ProposalStatus) => activeTopic !== filter
        )
      : [...selectedFilters, filter]);

  const updateProposalStoreFilters = () => {
    switch (category) {
      case "topics":
        proposalsFiltersStore.filterTopics(
          selectedFilters as unknown as Topic[]
        );
        return;
      case "status":
        proposalsFiltersStore.filterStatus(
          selectedFilters as unknown as ProposalStatus[]
        );
        return;
    }
  };

  const onChange = ({
    detail: { filter },
  }: CustomEvent<{
    filter: Filter<Topic | ProposalStatus> | undefined;
  }>) => {
    // `undefined` is added to be type safe, but it should never happen
    // checkboxes are shown only for filters that are defined
    if (filter !== undefined) {
      applyFilterChange(filter.value);
    }
  };

  const filter = () => {
    updateProposalStoreFilters();

    close();
  };

  const selectAll = () => {
    selectedFilters = sortedFilterValues.map(({ value }) => value);
  };

  const clear = () => {
    selectedFilters = [];
  };
</script>

<FilterModal
  {visible}
  on:nnsClose={close}
  on:nnsConfirm={filter}
  on:nnsChange={onChange}
  on:nnsSelectAll={selectAll}
  on:nnsClearSelection={clear}
  filters={sortedFilterValues}
>
  <span slot="title"
    >{keyOfOptional({ obj: $i18n.voting, key: category }) ?? ""}</span
  >
</FilterModal>
