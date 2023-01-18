<script lang="ts">
  import { onMount } from "svelte";
  import { onDestroy } from "svelte/internal";
  import {
    type MetricsCallback,
    initMetricsWorker,
  } from "$lib/services/$public/metrics-worker.services";
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
  $: total = totalNeurons ?? 0;
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
<p>TVL in USD: {total}</p>
