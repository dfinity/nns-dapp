<script lang="ts">
  import Modal from "../Modal.svelte";
  import { createEventDispatcher } from "svelte";
  import type {
    ProposalsFilterModalProps,
    ProposalsFilters,
  } from "../../types/proposals";
  import Checkbox from "../../components/ui/Checkbox.svelte";
  import { i18n } from "../../stores/i18n";
  import { enumValues } from "../../utils/enum.utils";
  import { proposalsFiltersStore } from "../../stores/proposals.store";
  import type {
    ProposalRewardStatus,
    ProposalStatus,
    Topic,
  } from "@dfinity/nns";
  import { PROPOSAL_FILTER_UNSPECIFIED_VALUE } from "../../types/proposals";

  export let props: ProposalsFilterModalProps | undefined;

  let visible: boolean;
  let category: string;
  let filters: ProposalsFilters | undefined;
  let filtersValues: number[];
  let selectedFilters: (Topic | ProposalRewardStatus | ProposalStatus)[];

  $: visible = props !== undefined;
  $: category = props?.category ?? "uncategorized";
  $: filters = props?.filters;
  $: filtersValues = filters
    ? enumValues(filters).filter(
        (value) => value !== PROPOSAL_FILTER_UNSPECIFIED_VALUE
      )
    : [];
  $: selectedFilters = props?.selectedFilters || [];

  const dispatch = createEventDispatcher();
  const close = () => dispatch("nnsClose", { selectedFilters });

  // Update list of selected filters with filter - i.e. toggle the checked or not checked of the filter that has been clicked
  const applyFilterChange = (
    filter: Topic | ProposalRewardStatus | ProposalStatus
  ) =>
    (selectedFilters = selectedFilters.includes(filter)
      ? selectedFilters.filter(
          (activeTopic: Topic | ProposalRewardStatus | ProposalStatus) =>
            activeTopic !== filter
        )
      : [...selectedFilters, filter]);

  const updateProposalStoreFilters = () => {
    switch (category) {
      case "topics":
        proposalsFiltersStore.filterTopics(
          selectedFilters as unknown as Topic[]
        );
        return;
      case "rewards":
        proposalsFiltersStore.filterRewards(
          selectedFilters as unknown as ProposalRewardStatus[]
        );
        return;
      case "status":
        proposalsFiltersStore.filterStatus(
          selectedFilters as unknown as ProposalStatus[]
        );
        return;
    }
  };

  const onChange = (filter: Topic | ProposalRewardStatus | ProposalStatus) =>
    applyFilterChange(filter);

  const filter = () => {
    updateProposalStoreFilters();

    close();
  };
</script>

<Modal {visible} on:nnsClose={close}>
  <span slot="title">{$i18n.voting?.[category] ?? ""}</span>

  {#if filters}
    {#each filtersValues as key (key)}
      <Checkbox
        inputId={`${key}`}
        checked={selectedFilters.includes(key)}
        on:nnsChange={() => onChange(key)}
        >{$i18n[category][filters[key]]}</Checkbox
      >
    {/each}
  {/if}

  <svelte:fragment slot="footer">
    <button class="primary" type="button" on:click={filter}>
      {$i18n.core.filter}
    </button>
  </svelte:fragment>
</Modal>

<style lang="scss">
  button {
    margin: var(--padding);
  }
</style>
