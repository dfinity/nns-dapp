<script lang="ts">
  import type { CanisterDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import { Card, SkeletonText } from "@dfinity/gix-components";
  import CanisterCardTitle from "./CanisterCardTitle.svelte";
  import CanisterCardSubTitle from "./CanisterCardSubTitle.svelte";
  import type { CyclesCallback } from "$lib/services/worker-cycles.services";
  import { onMount } from "svelte";
  import { initCyclesWorker } from "$lib/services/worker-cycles.services";
  import { onDestroy } from "svelte/internal";
  import type { PostMessageDataResponse } from "$lib/types/post-messages";
  import type { CanisterSync, CanisterSyncStatus } from "$lib/types/canister";
  import { formatNumber } from "$lib/utils/format.utils";
  import { nonNullish } from "$lib/utils/utils";

  export let canister: CanisterDetails;
  export let role: undefined | "link" | "button" | "checkbox" = undefined;
  export let ariaLabel: string | undefined = undefined;

  let worker:
    | {
        startCyclesTimer: (params: {
          canisterIds: string[];
          callback: CyclesCallback;
        }) => void;
        stopCyclesTimer: () => void;
      }
    | undefined;

  onMount(async () => (worker = await initCyclesWorker()));
  onDestroy(() => worker?.stopCyclesTimer());

  let canisterSync: CanisterSync | undefined = undefined;
  const syncCanister = ({ canister: data }: PostMessageDataResponse) =>
    (canisterSync = data);

  $: worker,
    canister,
    (() =>
      worker?.startCyclesTimer({
        canisterIds: [canister.canister_id.toText()],
        callback: syncCanister,
      }))();
</script>

<Card {role} {ariaLabel} on:click testId="canister-card">
  <div slot="start" class="title">
    <CanisterCardTitle {canister} />

    <CanisterCardSubTitle {canister} />
  </div>

  {#if nonNullish(canisterSync)}
    {#if canisterSync.sync === "syncing"}
      <p><SkeletonText /></p>
      <p><SkeletonText /></p>
      <p><SkeletonText /></p>
    {:else if canisterSync.sync === "synced" && nonNullish(canisterSync.data)}
      <p>
        <span class="value">{canisterSync.data.cycles}</span>
        <span class="label">Cycles</span>
      </p>
      <p>{canisterSync.data.status}</p>
      <p>{formatNumber(Number(canisterSync.data.memorySize) / 1000000)}mb</p>
    {/if}
  {/if}
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/card";
  @use "@dfinity/gix-components/styles/mixins/fonts";
  @use "@dfinity/gix-components/styles/mixins/media";

  .title {
    @include card.stacked-title;
    @include card.title;
  }

  span.value {
    @include fonts.h2(true);

    @include media.min-width(medium) {
      @include fonts.h1(true);
    }
  }
</style>
