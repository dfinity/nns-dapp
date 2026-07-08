<script lang="ts">
  import type { CanisterDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import {
    initCyclesWorker,
    type CyclesWorker,
  } from "$lib/services/worker-cycles.services";
  import { i18n } from "$lib/stores/i18n";
  import type { CanisterSync } from "$lib/types/canister";
  import type { PostMessageDataResponseCycles } from "$lib/types/post-message.canister";
  import {
    canisterStatusToText,
    formatCyclesToTCycles,
  } from "$lib/utils/canisters.utils";
  import { formatNumber } from "$lib/utils/format.utils";
  import { SkeletonText } from "@dfinity/gix-components";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { onDestroy } from "svelte";

  export let canister: CanisterDetails;

  let worker: CyclesWorker | undefined;

  const stopAndTerminate = () => {
    worker?.stopCyclesTimer();
    // Terminate the Web Worker, otherwise it keeps running (and holding memory)
    // after the card is destroyed, leaking one worker per canister on every
    // visit to the canisters page.
    worker?.terminate();
    worker = undefined;
  };

  onDestroy(stopAndTerminate);

  // The canister currently handled by the worker. Used to avoid re-creating a
  // worker when the `canister` prop changes but still points to the same
  // canister (e.g. when the list is reloaded), and to detect races when a new
  // init supersedes a pending one.
  let currentCanisterId: string | undefined;

  const initWorker = async (canisterId: string) => {
    stopAndTerminate();

    const newWorker = await initCyclesWorker();

    // A newer init superseded this one while we were awaiting: discard the
    // just-created worker instead of leaking it.
    if (canisterId !== currentCanisterId) {
      newWorker.terminate();
      return;
    }

    worker = newWorker;

    newWorker.startCyclesTimer({
      canisterId,
      callback: syncCanisterCallback,
    });
  };

  $: {
    const canisterId = canister.canister_id.toText();
    if (canisterId !== currentCanisterId) {
      currentCanisterId = canisterId;
      initWorker(canisterId);
    }
  }

  let canisterSync: CanisterSync | undefined = undefined;

  const syncCanisterCallback = ({
    canister: data,
  }: PostMessageDataResponseCycles) =>
    (canisterSync =
      data.id === canister.canister_id.toText() ? data : undefined);
</script>

<div>
  {#if isNullish(canisterSync) || canisterSync?.sync === "syncing"}
    <p><SkeletonText /></p>
    <p><SkeletonText /></p>
    <p><SkeletonText /></p>
  {:else if canisterSync.sync === "synced" && nonNullish(canisterSync.data)}
    <p class={`${canisterSync.cyclesStatus ?? ""}`} data-tid="canister-cycles">
      <span class="value"
        >{formatCyclesToTCycles(canisterSync.data.cycles)}</span
      >
      <span class="label">{$i18n.canister_detail.t_cycles}</span>
    </p>
    <p data-tid="canister-status">
      {canisterStatusToText(canisterSync.data.status)}
    </p>
    <p data-tid="canister-memory">
      {formatNumber(Number(canisterSync.data.memorySize) / 1_000_000)} MB
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

  .empty span {
    color: var(--negative-emphasis);
  }
</style>
