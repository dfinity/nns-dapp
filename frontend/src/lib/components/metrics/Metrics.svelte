<script lang="ts">
  import {
    type InitMetricsWorker,
    initMetricsWorker,
  } from "$lib/services/$public/worker-metrics.services";
  import { onMount, onDestroy } from "svelte";
  import { metricsStore } from "$lib/stores/metrics.store";

  import type { PostMessageDataResponseMetrics } from "$lib/types/post-message.metrics";

  let worker: InitMetricsWorker | undefined;

  onMount(async () => {
    worker = await initMetricsWorker();

    worker?.startMetricsTimer({
      callback: syncMetrics,
    });
  });
  onDestroy(() => worker?.stopMetricsTimer());

  // We keep in memory the previous metrics value
  const syncMetrics = ({ metrics: data }: PostMessageDataResponseMetrics) =>
    metricsStore.update((metrics) => ({
      tvl: data.tvl ?? metrics?.tvl,
      transactionRate: data.transactionRate ?? metrics?.transactionRate,
    }));
</script>

<!-- load metrics worker -->
