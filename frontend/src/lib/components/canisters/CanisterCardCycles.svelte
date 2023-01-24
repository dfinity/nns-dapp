<script lang="ts">
  import type { CanisterDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import {
    type CyclesCallback,
    initCyclesWorker,
  } from "$lib/services/worker-cycles.services";
  import { onMount } from "svelte";
  import { onDestroy } from "svelte/internal";
  import type { CanisterSync } from "$lib/types/canister";
  import type { PostMessageDataResponse } from "$lib/types/post-messages";
  import { isNullish, nonNullish } from "$lib/utils/utils";
  import { SkeletonText } from "@dfinity/gix-components";
  import { formatNumber } from "$lib/utils/format.utils";
  import {
    canisterStatusToText,
    formatCyclesToTCycles,
  } from "$lib/utils/canisters.utils";
  import { i18n } from "$lib/stores/i18n";

  export let canister: CanisterDetails;

  let worker:
    | {
        startCyclesTimer: (params: {
          canisterId: string;
          callback: CyclesCallback;
        }) => void;
        stopCyclesTimer: () => void;
      }
    | undefined;

  onMount(async () => {
    worker = await initCyclesWorker();

    worker.startCyclesTimer({
      canisterId: canister.canister_id.toText(),
      callback: syncCanisterCallback,
    });
  });
  onDestroy(() => worker?.stopCyclesTimer());

  let canisterSync: CanisterSync | undefined = undefined;
  // Multiple workers that sync canister information can be appended to a view.
  // postMessage being broadcasted, we filter the information that matches this canister.
  const syncCanisterCallback = ({ canister: data }: PostMessageDataResponse) =>
    (canisterSync =
      data?.id === canister.canister_id.toText() ? data : undefined);
</script>

<div>
  {#if isNullish(canisterSync) || canisterSync?.sync === "syncing"}
    <p><SkeletonText /></p>
    <p><SkeletonText /></p>
    <p><SkeletonText /></p>
  {:else if canisterSync.sync === "synced" && nonNullish(canisterSync.data)}
    <p class="info" data-tid="canister-cycles">
      <span class="value"
        >{formatCyclesToTCycles(canisterSync.data.cycles)}</span
      >
      <span class="label">{$i18n.canister_detail.t_cycles}</span>
    </p>
    <p class="info description" data-tid="canister-status">
      {canisterStatusToText(canisterSync.data.status)}
    </p>
    <p class="info description" data-tid="canister-memory">
      {formatNumber(Number(canisterSync.data.memorySize) / 1_000_000)}mb
    </p>
  {/if}
</div>

<style lang="scss">
  div {
    display: flex;
    flex-direction: column;
    height: var(--padding-8x);
  }

  p {
    margin: 0 0 var(--padding-0_5x);
    line-height: var(--line-height-standard);
    --skeleton-text-line-height: 0.65;
  }
</style>
