<script lang="ts">
  import Modal from "./Modal.svelte";
  import {createEventDispatcher} from 'svelte';

  export let filters:
    | { title: string, allFilters: string[]; activeFilters: string[] }
    | undefined;

  let visible: boolean;

  let title: string;
  let allFilters: string[];
  let activeFilters: string[];

  $: visible = filters !== undefined;
  $: title = filters?.title || '';
  $: allFilters = filters?.allFilters || [];
  $: activeFilters = filters?.activeFilters || [];

  const dispatch = createEventDispatcher();
  const close = () => dispatch("close");
</script>

<Modal {visible} on:close={close}>
  <span slot="title">{title}</span>

  {#each allFilters as filter}
    <span>{filter}</span>
  {/each}
</Modal>
