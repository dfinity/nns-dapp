<script lang="ts">
  import { onMount } from "svelte";
  import { onDestroy } from "svelte/internal";
  import {
    type DashboardCallback,
    initDashboardWorker,
  } from "$lib/services/$public/dashboard-worker.services";
  import type { DashboardSync } from "$lib/types/dashboard";
  import type { PostMessageDataResponse } from "$lib/types/post-messages";

  let worker:
    | {
        startDashboardTimer: (params: { callback: DashboardCallback }) => void;
        stopDashboardTimer: () => void;
      }
    | undefined;

  onMount(async () => (worker = await initDashboardWorker()));
  onDestroy(() => worker?.stopDashboardTimer());

  let canisterSync: DashboardSync | undefined = undefined;
  const syncDashboard = ({ dashboard: data }: PostMessageDataResponse) =>
    (canisterSync = data);

  $: worker,
    (() =>
      worker?.startDashboardTimer({
        callback: syncDashboard,
      }))();
</script>

<p>ICP to USD: {canisterSync?.avgPrice?.price}</p>
