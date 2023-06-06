<script lang="ts">
  import { onDestroy } from "svelte";
  import type { AccountsWorker } from "$lib/services/worker-accounts.services";
  import { initAccountsWorker } from "$lib/services/worker-accounts.services";
  import type { AccountsObserverData } from "$lib/types/icrc.observer";

  export let data: AccountsObserverData;

  let worker: AccountsWorker | undefined;

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
