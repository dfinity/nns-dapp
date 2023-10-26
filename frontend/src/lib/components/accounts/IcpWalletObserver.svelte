<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { WalletObserverData } from "$lib/types/icrc.observer";
  import {
    initIcpWalletWorker,
    type WalletCallback,
    type WalletWorker,
  } from "$lib/services/worker-icp-wallet.services";

  export let data: WalletObserverData;
  export let callback: WalletCallback;

  let worker: WalletWorker | undefined;

  onDestroy(() => worker?.stopWalletTimer());

  const initWorker = async () => {
    worker?.stopWalletTimer();

    worker = await initIcpWalletWorker();

    const {
      account: { identifier },
      indexCanisterId,
    } = data;

    worker?.startWalletTimer({
      indexCanisterId,
      accountIdentifier: identifier,
      callback,
    });
  };

  onMount(async () => await initWorker());
</script>

<slot />
