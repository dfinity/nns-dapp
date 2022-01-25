<script lang="ts">
  import Modal from "./Modal.svelte";
  import { createEventDispatcher } from "svelte";
  import type { VotingFilterModalProps, VotingFilters } from "../types/voting";
  import Checkbox from "../components/Checkbox.svelte";
  import { i18n } from "../stores/i18n";

  export let props: VotingFilterModalProps | undefined;

  let visible: boolean;
  let i18nKey: string | undefined;
  let filters: VotingFilters | undefined;

  // TODO(#L2-206): do we want a store or pass props?
  let activeTopics: VotingFilters[] = [];

  $: visible = props !== undefined;
  $: i18nKey = props?.key;
  $: filters = props?.filters;

  const dispatch = createEventDispatcher();
  const close = () => dispatch("nnsClose");

  const select = (topic: VotingFilters) =>
    (activeTopics = activeTopics.includes(topic)
      ? activeTopics.filter(
          (activeTopic: VotingFilters) => activeTopic !== topic
        )
      : [...activeTopics, topic]);
</script>

<Modal {visible} on:nnsClose={close}>
  <span slot="title">{$i18n.voting?.[i18nKey] || ""}</span>

  {#if filters}
    {#each Object.keys(filters) as key (key)}
      <Checkbox
        inputId={key}
        checked={activeTopics.includes(filters[key])}
        on:nnsChange={() => select(filters[key])}
        >{$i18n[i18nKey][filters[key]]}</Checkbox
      >
    {/each}
  {/if}
</Modal>
