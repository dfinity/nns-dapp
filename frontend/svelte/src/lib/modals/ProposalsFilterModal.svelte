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

  export let props: ProposalsFilterModalProps | undefined;

  let visible: boolean;
  let labelKey: string | undefined;
  let filters: ProposalsFilters | undefined;

  // TODO(#L2-206): do we want a store or pass props?
  let activeTopics: ProposalsFilters[] = [];

  $: visible = props !== undefined;
  $: labelKey = props?.labelKey;
  $: filters = props?.filters;

  const dispatch = createEventDispatcher();
  const close = () => dispatch("nnsClose");

  const select = (topic: ProposalsFilters) =>
    (activeTopics = activeTopics.includes(topic)
      ? activeTopics.filter(
          (activeTopic: ProposalsFilters) => activeTopic !== topic
        )
      : [...activeTopics, topic]);
</script>

<Modal {visible} on:nnsClose={close}>
  <span slot="title">{$i18n.voting?.[labelKey] || ""}</span>

  {#if filters}
    {#each enumValues(filters) as key (key)}
      <Checkbox
        inputId={key}
        checked={activeTopics.includes(filters[key])}
        on:nnsChange={() => select(filters[key])}
        >{$i18n[labelKey][filters[key]]}</Checkbox
      >
    {/each}
  {/if}
</Modal>
