<script lang="ts">
  import type { CanisterDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import { Card } from "@dfinity/gix-components";
  import CanisterCardTitle from "./CanisterCardTitle.svelte";
  import CanisterCardSubTitle from "./CanisterCardSubTitle.svelte";
  import type { CyclesCallback } from "$lib/services/worker-cycles.services";
  import { onMount } from "svelte";
  import { initCyclesWorker } from "$lib/services/worker-cycles.services";
  import { onDestroy } from "svelte/internal";
  import type { PostMessageDataResponse } from "$lib/types/post-messages";

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

  const syncCanister = ({ canister: c }: PostMessageDataResponse) => {
    // TODO: display information
    console.log(c);
  };

  $: worker,
    canister,
    (() =>
      worker?.startCyclesTimer({
        canisterIds: [canister.canister_id.toText()],
        callback: syncCanister,
      }))();
</script>

<Card {role} {ariaLabel} on:click testId="canister-card">
  <CanisterCardTitle {canister} />

  <CanisterCardSubTitle {canister} />
</Card>
