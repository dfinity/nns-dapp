<script lang="ts">
  import Modal from "./Modal.svelte";
  import { createEventDispatcher } from "svelte";
  import type {
    ProposalsFilterModalProps,
    ProposalsFilters,
  } from "../types/proposals";
  import Checkbox from "../components/ui/Checkbox.svelte";
  import { i18n } from "../stores/i18n";
  import { enumValues } from "../utils/enum.utils";
  import { proposalsStore } from "../stores/proposals.store";
  import {
    ProposalRewardStatus,
    ProposalStatus,
    Topic,
  } from "../../../../../../nns-js";

  export let props: ProposalsFilterModalProps | undefined;

  let visible: boolean;
  let category: string | undefined;
  let filters: ProposalsFilters | undefined;
  let selectedFilters: ProposalsFilters[];

  $: visible = props !== undefined;
  $: category = props?.category;
  $: filters = props?.filters;
  $: selectedFilters = props?.selectedFilters || [];

  const dispatch = createEventDispatcher();
  const close = () => dispatch("nnsClose", { selectedFilters });

  const filterSelected = (filter: ProposalsFilters) =>
    (selectedFilters = selectedFilters.includes(filter)
      ? selectedFilters.filter(
          (activeTopic: ProposalsFilters) => activeTopic !== filter
        )
      : [...selectedFilters, filter]);

  const updateProposalStoreFilters = () => {
    switch (category) {
      case "topics":
        proposalsStore.filterTopics(selectedFilters as Topic[]);
        return;
      case "rewards":
        proposalsStore.filterRewards(selectedFilters as ProposalRewardStatus[]);
        return;
      case "status":
        proposalsStore.filterStatus(selectedFilters as ProposalStatus[]);
        return;
    }
  };

  const select = (filter: ProposalsFilters) => {
    filterSelected(filter);

    updateProposalStoreFilters();
  };
</script>

<Modal {visible} on:nnsClose={close}>
  <span slot="title">{$i18n.voting?.[category] || ""}</span>

  {#if filters}
    {#each enumValues(filters) as key (key)}
      <Checkbox
        inputId={key}
        checked={selectedFilters.includes(key)}
        on:nnsChange={() => select(key)}
        >{$i18n[category][filters[key]]}</Checkbox
      >
    {/each}
  {/if}
</Modal>
