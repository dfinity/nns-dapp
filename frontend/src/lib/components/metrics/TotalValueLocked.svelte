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

  let canisterSync: MetricsSync | undefined = undefined;
  const syncMetrics = ({ metrics: data }: PostMessageDataResponse) =>
    (canisterSync = data);

  $: worker,
    (() =>
      worker?.startMetricsTimer({
        callback: syncMetrics,
      }))();

  let totalNeurons: number | undefined;
  $: totalNeurons =
    canisterSync?.dissolvingTotalNeurons?.data?.[0]?.samples[0]?.value +
    canisterSync?.notDissolvingTotalNeurons?.data?.[0]?.samples[0]?.value;

  let total: number | undefined;
  $: total = totalNeurons ?? 0;
</script>

<p>ICP to USD: {canisterSync?.avgPrice?.price}</p>
<p>
  Total dissolving neurons: {canisterSync?.dissolvingTotalNeurons?.data?.[0]
    ?.samples[0]?.value}
</p>
<p>
  Total not dissolving neurons: {canisterSync?.notDissolvingTotalNeurons
    ?.data?.[0]?.samples[0]?.value}
</p>
<p>TVL in USD: {total}</p>
