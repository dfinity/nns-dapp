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
</script>

<p>ICP to USD: {canisterSync?.avgPrice?.price}</p>
