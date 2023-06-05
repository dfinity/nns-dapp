<script lang="ts">
  import { onDestroy } from "svelte";
  import type { InitAccountsWorker } from "$lib/services/worker-accounts.services";
  import { initAccountsWorker } from "$lib/services/worker-accounts.services";
  import type { AccountsObserverData } from "$lib/types/accounts.observer";
  import { arrayOfNumberToUint8Array, nonNullish } from "@dfinity/utils";

  export let data: AccountsObserverData;

  let worker: InitAccountsWorker | undefined;

  onDestroy(() => worker?.stopAccountsTimer());

  const initWorker = async () => {
    worker?.stopAccountsTimer();

    worker = await initAccountsWorker();

    const {
      account: { identifier },
      ledgerCanisterId,
    } = data;

    worker?.startAccountsTimer({
      ledgerCanisterId,
      accounts: [identifier],
      callback: () => console.log("TODO"),
    });
  };

  $: data, (async () => await initWorker())();
</script>

<slot />
