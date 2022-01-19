<script lang="ts">
  import Modal from "./Modal.svelte";
  import { createEventDispatcher } from "svelte";
  import Radio from "../components/Radio.svelte";
  import type { VotingFilterModalProps, VotingFilters } from "../types/voting";

  export let filters: VotingFilterModalProps | undefined;

  let visible: boolean;

  let title: string;
  let allKeys: string[];
  let activeKeys: string[];
  let allFilters: VotingFilters | undefined;

  $: visible = filters !== undefined;
  $: title = filters?.title || "";
  $: allKeys = Object.keys(filters?.allFilters || []);
  $: activeKeys = Object.keys(filters?.activeFilters || []);
  $: allFilters = filters?.allFilters;

  const dispatch = createEventDispatcher();
  const close = () => dispatch("close");
</script>

<Modal {visible} on:close={close}>
  <span slot="title">{title}</span>

  {#if allFilters}
    {#each allKeys as key}
      <Radio
        name={key}
        value={allFilters[key]}
        checked={activeKeys.includes(key)}>{allFilters[key]}</Radio
      >
    {/each}
  {/if}
</Modal>
