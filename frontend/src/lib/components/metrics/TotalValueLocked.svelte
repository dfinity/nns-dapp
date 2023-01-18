<script lang="ts">
  import { onMount } from "svelte";
  import { onDestroy } from "svelte/internal";
  import {
    type MetricsCallback,
    initMetricsWorker,
  } from "$lib/services/$public/worker-metrics.services";
  import type { MetricsSync } from "$lib/types/metrics";
  import type { PostMessageDataResponse } from "$lib/types/post-messages";
  import { i18n } from "$lib/stores/i18n";
  import { fade } from "svelte/transition";
  import { nonNullish } from "$lib/utils/utils";
  import { metricsStore } from "$lib/stores/metrics.store";
  import { E8S_PER_ICP } from "$lib/constants/icp.constants";

  export let layout: "inline" | "stacked" = "inline";

  let worker:
    | {
        startMetricsTimer: (params: { callback: MetricsCallback }) => void;
        stopMetricsTimer: () => void;
      }
    | undefined;

  onMount(async () => {
    worker = await initMetricsWorker();

    worker?.startMetricsTimer({
      callback: syncMetrics,
    });
  });
  onDestroy(() => worker?.stopMetricsTimer());

  const syncMetrics = ({ metrics: data }: PostMessageDataResponse) =>
    metricsStore.set(data);

  let totalNeurons: number | undefined;
  $: totalNeurons =
    ($metricsStore?.dissolvingNeurons?.totalDissolvingNeurons ?? 0) +
    ($metricsStore?.dissolvingNeurons?.totalNotDissolvingNeurons ?? 0);

  let total: number | undefined;
  $: total =
    ((totalNeurons ?? 0) / E8S_PER_ICP) *
    Number($metricsStore?.avgPrice?.price ?? "0");

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const format = (n: number): string => formatter.format(n);
</script>

{#if nonNullish(total) && total > 0}
  <div
    class="tvl"
    transition:fade={{ duration: 125 }}
    class:stacked={layout === "stacked"}
  >
    <span>{$i18n.metrics.tvl}</span>
    <span data-tid="tvl-metric" class="total">{format(total)}</span>
  </div>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/fonts";
  @use "@dfinity/gix-components/styles/mixins/media";

  .tvl {
    display: inline-block;

    text-align: center;

    gap: var(--padding-0_5x);
    z-index: var(--z-index);

    @include fonts.small;

    background: rgba(var(--background-disable-rgb), 0.1);
    color: var(--body-color);

    border-radius: var(--border-radius);

    width: 100%;
    padding: var(--padding) var(--padding-2x);

    &.stacked {
      display: flex;
      flex-direction: column-reverse;
      gap: var(--padding-0_5x);

      background: rgba(var(--focus-background-rgb), 0.8);
      color: var(--text2-color);

      .total {
        color: var(--text-color);
        @include fonts.h5(false);
      }
    }
  }

  .total {
    color: var(--menu-select-color);
  }

  @include media.dark-theme {
    .tvl {
      background: rgba(var(--background-disable-rgb), 1);
    }
  }
</style>
