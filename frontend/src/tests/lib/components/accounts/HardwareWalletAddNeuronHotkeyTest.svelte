<script lang="ts">
  import { setContext, SvelteComponent } from "svelte";
  import {
    mockHardwareWalletNeuronsStore,
    mockNeuronStake,
  } from "../../../mocks/hardware-wallet-neurons.store.mock";
  import { WALLET_CONTEXT_KEY, WalletContext } from "$lib/types/wallet.context";

  export let testComponent: typeof SvelteComponent;

  setContext<WalletContext>(WALLET_CONTEXT_KEY, {
    store: mockHardwareWalletNeuronsStore,
  });
</script>

<svelte:component this={testComponent} neuronId={mockNeuronStake.neuronId} />
