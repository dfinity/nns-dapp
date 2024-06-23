<script lang="ts">
  import type {
    BalancesCallback,
    BalancesWorker,
  } from "$lib/services/worker-balances.services";
  import { initBalancesWorker } from "$lib/services/worker-balances.services";
  import type { BalancesObserverData } from "$lib/types/icrc.observer";
  import { onDestroy, onMount } from "svelte";

  export let data: BalancesObserverData;
  export let callback: BalancesCallback;

  let worker: BalancesWorker | undefined;

  onDestroy(() => worker?.stopBalancesTimer());

  const initWorker = async () => {
    worker?.stopBalancesTimer();

    worker = await initBalancesWorker();

    const { accounts, ledgerCanisterId } = data;

    worker?.startBalancesTimer({
      ledgerCanisterId,
      accountIdentifiers: accounts.map(({ identifier }) => identifier),
      callback,
    });
  };

  onMount(async () => await initWorker());
</script>

<slot />
