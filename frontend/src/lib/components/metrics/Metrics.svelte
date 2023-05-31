<script lang="ts">
  import {
    initMetricsWorker,
    type MetricsCallback,
  } from "$lib/services/$public/worker-metrics.services";
  import { onMount, onDestroy } from "svelte";
  import { metricsStore } from "$lib/stores/metrics.store";
  import { nonNullish } from "@dfinity/utils";

  import type {PostMessageDataResponseMetrics} from "$lib/types/post-message.metrics";

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

  // We keep in memory the previous metrics value
  const syncMetrics = ({ metrics: data }: PostMessageDataResponseMetrics) =>
    metricsStore.update((metrics) =>
      nonNullish(data)
        ? {
            tvl: data.tvl ?? metrics?.tvl,
            transactionRate: data.transactionRate ?? metrics?.transactionRate,
          }
        : metrics
    );
</script>

<!-- load metrics worker -->
