<script lang="ts">
  import { onDestroy } from "svelte";
  import type { TransactionsObserverData } from "$lib/types/icrc.observer";
  import type {TransactionsCallback, TransactionsWorker} from "$lib/services/worker-transactions.services";
  import { initTransactionsWorker } from "$lib/services/worker-transactions.services";

  export let data: TransactionsObserverData;
  export let callback: TransactionsCallback;

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
      accountIdentifiers: [identifier],
      callback,
    });
  };

  $: data, (async () => await initWorker())();
</script>

<slot />
