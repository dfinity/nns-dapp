<script lang="ts">
  import Modal from "./Modal.svelte";
  import { createEventDispatcher } from "svelte";
  import Radio from "../components/Radio.svelte";
  import { VotingFilterModalProps, VotingFilters } from "../types/voting";

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
      <Radio
        name={key}
        value={filters[key]}
        checked={activeTopics.includes(filters[key])}
        on:select={() => select(filters[key])}
      />
    {/each}
  {/if}
</Modal>
