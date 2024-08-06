<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import NeuronsTable from "$lib/components/neurons/NeuronsTable/NeuronsTable.svelte";
  import { IconInfo } from "@dfinity/gix-components";
  import EmptyMessage from "$lib/components/ui/EmptyMessage.svelte";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { listNeurons } from "$lib/services/neurons.services";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import { definedNeuronsStore, neuronsStore } from "$lib/stores/neurons.store";
  import type { TableNeuron } from "$lib/types/neurons-table";
  import { tableNeuronsFromNeuronInfos } from "$lib/utils/neurons-table.utils";
  import { Spinner } from "@dfinity/gix-components";
  import { onMount } from "svelte";

  let isLoading = false;
  $: isLoading = $neuronsStore.neurons === undefined;

  onMount(() => {
    listNeurons();
  });

  let tableNeurons: TableNeuron[] = [];
  $: tableNeurons = tableNeuronsFromNeuronInfos({
    identity: $authStore.identity,
    accounts: $icpAccountsStore,
    i18n: $i18n,
    neuronInfos: $definedNeuronsStore,
  });
</script>

<TestIdWrapper testId="nns-neurons-component">
  {#if isLoading}
    <Spinner />
  {:else if tableNeurons.length > 0}
    <div class="topic-split-message" data-tid="topic-split-message">
      <div class="icon-info">
        <IconInfo />
      </div>
      <span>
        {$i18n.neurons.split_topic_message}
        <a
          href="https://forum.dfinity.org/t/refine-nns-proposals-topics/32125"
          rel="noopener noreferrer"
          aria-label={$i18n.neurons.split_topic_learn_more_label}
          target="_blank">{$i18n.core.learn_more}</a
        >
      </span>
    </div>
    <NeuronsTable neurons={tableNeurons} />
  {:else}
    <EmptyMessage>{$i18n.neurons.text}</EmptyMessage>
  {/if}
</TestIdWrapper>

<style lang="scss">
  .topic-split-message {
    display: flex;
    gap: var(--padding);
    align-items: center;

    background-color: var(--card-background);
    border-radius: var(--border-radius);
    margin-bottom: var(--padding-2x);
    padding: var(--padding-2x);

    .icon-info {
      padding: var(--padding);
      background-color: var(--tooltip-border-color);
      border-radius: 50%;
    }
  }
</style>
