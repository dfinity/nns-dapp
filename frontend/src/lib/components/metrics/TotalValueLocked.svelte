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

  let worker:
    | {
        startMetricsTimer: (params: { callback: MetricsCallback }) => void;
        stopMetricsTimer: () => void;
      }
    | undefined;

  onMount(async () => (worker = await initMetricsWorker()));
  onDestroy(() => worker?.stopMetricsTimer());

  let metricsSync: MetricsSync | undefined = undefined;
  const syncMetrics = ({ metrics: data }: PostMessageDataResponse) =>
    (metricsSync = data);

  $: worker,
    (() =>
      worker?.startMetricsTimer({
        callback: syncMetrics,
      }))();

  let totalNeurons: number | undefined;
  $: totalNeurons =
    (metricsSync?.dissolvingNeurons?.totalDissolvingNeurons ?? 0) +
    (metricsSync?.dissolvingNeurons?.totalNotDissolvingNeurons ?? 0);

  let total: number | undefined;
  $: total =
    ((totalNeurons ?? 0) / 1_000_00_000) * (metricsSync?.avgPrice?.price ?? 0);

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const format = (n: number): string => formatter.format(n);
</script>

{#if total > 0}
  <div class="tvl" transition:fade={{ duration: 125 }}>
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

    @include fonts.small;

    background: rgba(var(--background-disable-rgb), 0.1);
    color: var(--body-color);

    border-radius: var(--border-radius);

    padding: var(--padding) var(--padding-2x);
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
