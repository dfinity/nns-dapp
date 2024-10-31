<script lang="ts">
  import {
    initMetricsWorker,
    type MetricsWorker,
  } from "$lib/services/public/worker-metrics.services";
  import { metricsStore } from "$lib/stores/metrics.store";
  import { onDestroy, onMount } from "svelte";

  import type { PostMessageDataResponseMetrics } from "$lib/types/post-message.metrics";

  let worker: MetricsWorker | undefined;

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
