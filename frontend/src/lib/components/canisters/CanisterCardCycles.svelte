<script lang="ts">
  import type { CanisterDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import {
    type CyclesCallback,
    initCyclesWorker,
  } from "$lib/services/worker-cycles.services";
  import { onMount } from "svelte";
  import { onDestroy } from "svelte/internal";
  import type { CanisterSync } from "$lib/types/canister";
  import { type PostMessageDataResponse } from "$lib/types/post-messages";
  import { isNullish, nonNullish } from "$lib/utils/utils";
  import { SkeletonText } from "@dfinity/gix-components";
  import { formatNumber } from "$lib/utils/format.utils";
  import { formatCyclesToTCycles } from "$lib/utils/canisters.utils";
  import CanisterStatus from "$lib/components/canisters/CanisterStatus.svelte";

  export let canister: CanisterDetails;

  let worker:
    | {
        startCyclesTimer: (params: {
          canisterIds: string[];
          callback: CyclesCallback;
        }) => void;
        stopCyclesTimer: () => void;
      }
    | undefined;

  onMount(async () => {
    worker = await initCyclesWorker();

    worker.startCyclesTimer({
      canisterIds: [canister.canister_id.toText()],
      callback: syncCanister,
    });
  });
  onDestroy(() => worker?.stopCyclesTimer());

  let canisterSync: CanisterSync | undefined = undefined;
  const syncCanister = ({ canister: data }: PostMessageDataResponse) =>
    (canisterSync =
      data?.id === canister.canister_id.toText() ? data : undefined);
</script>

{#if isNullish(canisterSync) || canisterSync?.sync === "syncing"}
  <p><SkeletonText /></p>
  <p><SkeletonText /></p>
  <p><SkeletonText /></p>
{:else if nonNullish(canisterSync) && canisterSync.sync === "synced" && nonNullish(canisterSync.data)}
  <p class="info">
    <span class="value">{formatCyclesToTCycles(canisterSync.data.cycles)}</span>
    <span class="label">TCycles</span>
  </p>
  <p class="info description">
    <CanisterStatus status={canisterSync.data.status} />
  </p>
  <p class="info description">
    {formatNumber(Number(canisterSync.data.memorySize) / 1000000)}mb
  </p>
{/if}

<style lang="scss">
  p {
    margin: 0 0 var(--padding-0_5x);
    line-height: var(--line-height-standard);
    --skeleton-text-line-height: 0.65;
  }
</style>
