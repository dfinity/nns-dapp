<script lang="ts">
  import { onDestroy } from "svelte";
  import type { TransactionsObserverData } from "$lib/types/icrc.observer";
  import type { TransactionsWorker } from "$lib/services/worker-transactions.services";
  import { initTransactionsWorker } from "$lib/services/worker-transactions.services";

  export let data: TransactionsObserverData;

  let worker: TransactionsWorker | undefined;

  onDestroy(() => worker?.stopTransactionsTimer());

  const initWorker = async () => {
    worker?.stopTransactionsTimer();

    worker = await initTransactionsWorker();

    const {
      account: { identifier },
      indexCanisterId,
    } = data;

    worker?.startTransactionsTimer({
      indexCanisterId,
      accounts: [identifier],
      callback: () => console.log("TODO"),
    });
  };

  $: data, (async () => await initWorker())();
</script>

<slot />
