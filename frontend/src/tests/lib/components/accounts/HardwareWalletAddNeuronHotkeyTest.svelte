<script lang="ts">
  import { WALLET_CONTEXT_KEY, WalletContext } from "$lib/types/wallet.context";
  import {
    mockHardwareWalletNeuronsStore,
    mockNeuronStake,
  } from "$tests/mocks/hardware-wallet-neurons.store.mock";
  import { SvelteComponent, setContext } from "svelte";

  export let testComponent: typeof SvelteComponent;

  setContext<WalletContext>(WALLET_CONTEXT_KEY, {
    store: mockHardwareWalletNeuronsStore,
  });
</script>

<svelte:component this={testComponent} neuronId={mockNeuronStake.neuronId} />
