<script lang="ts">
  import { setContext, SvelteComponent } from "svelte";
  import {
    WALLET_CONTEXT_KEY,
    type WalletContext,
  } from "$lib/types/wallet.context";
  import { mockHardwareWalletNeuronsStore } from "../../../mocks/hardware-wallet-neurons.store.mock";

  export let testComponent: typeof SvelteComponent;

  setContext<WalletContext>(WALLET_CONTEXT_KEY, {
    store: mockHardwareWalletNeuronsStore,
  });
</script>

<svelte:component this={testComponent} />
