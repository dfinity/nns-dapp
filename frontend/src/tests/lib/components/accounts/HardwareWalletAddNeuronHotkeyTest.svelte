<script lang="ts">
  import {
    WALLET_CONTEXT_KEY,
    type WalletContext,
  } from "$lib/types/wallet.context";
  import {
    mockHardwareWalletNeuronsStore,
    mockNeuronStake,
  } from "$tests/mocks/hardware-wallet-neurons.store.mock";
  import { setContext, type Component } from "svelte";

  export let testComponent: Component;

  setContext<WalletContext>(WALLET_CONTEXT_KEY, {
    store: mockHardwareWalletNeuronsStore,
  });
</script>

<svelte:component this={testComponent} neuronId={mockNeuronStake.neuronId} />
