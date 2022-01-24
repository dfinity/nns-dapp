<script lang="ts">
  import Modal from "./Modal.svelte";
  import { createEventDispatcher } from "svelte";
  import { VotingFilterModalProps, VotingFilters } from "../types/voting";
  import Checkbox from "../components/Checkbox.svelte";

  export let props: VotingFilterModalProps | undefined;

  let visible: boolean;
  let title: string;
  let filters: VotingFilters | undefined;

  // TODO(#L2-206): do we want a store or pass props?
  let activeTopics: VotingFilters[] = [];

  $: visible = props !== undefined;
  $: title = props?.title || "";
  $: filters = props?.filters;

  const dispatch = createEventDispatcher();
  const close = () => dispatch("close");

  const select = (topic: VotingFilters) =>
    (activeTopics = activeTopics.includes(topic)
      ? activeTopics.filter(
          (activeTopic: VotingFilters) => activeTopic !== topic
        )
      : [...activeTopics, topic]);
</script>

<Modal {visible} on:close={close}>
  <span slot="title">{title}</span>

  {#if filters}
    {#each Object.keys(filters) as key}
      <Checkbox
        inputId={key}
        checked={activeTopics.includes(filters[key])}
        on:select={() => select(filters[key])}>{filters[key]}</Checkbox
      >
    {/each}
  {/if}
</Modal>
