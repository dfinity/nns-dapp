<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import NnsNeuronCard from "$lib/components/neurons/NnsNeuronCard.svelte";
  import { neuronsStore, sortedNeuronStore } from "$lib/stores/neurons.store";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { IconInfo, Tooltip } from "@dfinity/gix-components";
  import { isSpawning } from "$lib/utils/neuron.utils";
  import { pageStore } from "$lib/derived/page.derived";
  import { buildNeuronUrl } from "$lib/utils/navigation.utils";
  import EmptyMessage from "$lib/components/ui/EmptyMessage.svelte";
  import { onMount } from "svelte";
  import { listNeurons } from "$lib/services/neurons.services";

  let isLoading = false;
  $: isLoading = $neuronsStore.neurons === undefined;

  onMount(() => {
    listNeurons();
  });
</script>

<TestIdWrapper testId="nns-neurons-component">
  {#if !isLoading && $sortedNeuronStore.length > 0}
    <div class="topic-rename-message" data-tid="topic-rename-message">
      <div class="icon-info">
        <IconInfo />
      </div>
      <span>
        {$i18n.neurons.rename_topic_message}
        <a
          href=""
          rel="noopener noreferrer"
          aria-label={$i18n.neurons.rename_topic_learn_more_label}
          target="_blank">{$i18n.core.learn_more}</a
        >
      </span>
    </div>
  {/if}
  <div class="card-grid" data-tid="neurons-body">
    {#if isLoading}
      <SkeletonCard />
      <SkeletonCard />
    {:else}
      {#each $sortedNeuronStore as neuron}
        {#if isSpawning(neuron)}
          <Tooltip
            id="spawning-neuron-card"
            text={$i18n.neuron_detail.spawning_neuron_info}
          >
            <NnsNeuronCard
              disabled
              ariaLabel={$i18n.neurons.aria_label_neuron_card}
              {neuron}
            />
          </Tooltip>
        {:else}
          <NnsNeuronCard
            ariaLabel={$i18n.neurons.aria_label_neuron_card}
            href={buildNeuronUrl({
              universe: $pageStore.universe,
              neuronId: neuron.neuronId,
            })}
            {neuron}
          />
        {/if}
      {/each}
    {/if}
  </div>

  {#if !isLoading && $sortedNeuronStore.length === 0}
    <EmptyMessage>{$i18n.neurons.text}</EmptyMessage>
  {/if}
</TestIdWrapper>

<style lang="scss">
  .topic-rename-message {
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
