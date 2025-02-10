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
  import { keyOfOptional } from "$lib/utils/utils";
  import type { ProposalStatus, Topic } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import {
    getProposalStatusTitle,
    getTopicTitle,
  } from "$lib/utils/neuron.utils";

  export let props: ProposalsFilterModalProps | undefined;

  let visible: boolean;
  let category: string;
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
        props?.category === undefined
          ? "Unspecified"
          : props?.category === "status"
            ? getProposalStatusTitle({
                status: value as ProposalStatus,
                i18n: $i18n,
              })
            : getTopicTitle({ topic: value as Topic, i18n: $i18n }),
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
    selectedFilters = filtersValues.map(({ value }) => value);
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
  filters={filtersValues}
>
  <span slot="title"
    >{keyOfOptional({ obj: $i18n.voting, key: category }) ?? ""}</span
  >
</FilterModal>
