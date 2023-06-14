<script lang="ts">
  import { onDestroy } from "svelte";
  import type {
    BalancesCallback,
    BalancesWorker,
  } from "$lib/services/worker-balances.services";
  import { initBalancesWorker } from "$lib/services/worker-balances.services";
  import type { AccountsObserverData } from "$lib/types/icrc.observer";

  export let data: AccountsObserverData;
  export let callback: BalancesCallback;

  let worker: BalancesWorker | undefined;

  onDestroy(() => worker?.stopBalancesTimer());

  const initWorker = async () => {
    worker?.stopBalancesTimer();

    worker = await initBalancesWorker();

    const {
      account: { identifier },
      ledgerCanisterId,
    } = data;

    worker?.startBalancesTimer({
      ledgerCanisterId,
      accountIdentifiers: [identifier],
      callback,
    });
  };

  $: data, (async () => await initWorker())();
</script>

<slot />
