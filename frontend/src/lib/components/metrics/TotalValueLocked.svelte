<script lang="ts">
  import { onMount } from "svelte";
  import { onDestroy } from "svelte/internal";
  import {
    type MetricsCallback,
    initMetricsWorker,
  } from "$lib/services/$public/worker-metrics.services";
  import type { MetricsSync } from "$lib/types/metrics";
  import type { PostMessageDataResponse } from "$lib/types/post-messages";

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

    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  });

  const format = (n: number): string => formatter.format(n);
</script>

<p>ICP to USD: {metricsSync?.avgPrice?.price}</p>
<p>
  Total dissolving neurons: {metricsSync?.dissolvingNeurons
    ?.totalDissolvingNeurons}
</p>
<p>
  Total not dissolving neurons: {metricsSync?.dissolvingNeurons
    ?.totalNotDissolvingNeurons}
</p>
<p>Divider constant: {1_000_00_000}</p>

{#if total > 0}
  <p data-tid="tvl-metric">TVL in USD: {format(total)}</p>
{/if}
