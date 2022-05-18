<script lang="ts">
  import { setContext, SvelteComponent } from "svelte";
  import {
    HARDWARE_WALLET_NEURONS_CONTEXT_KEY,
    type HardwareWalletNeuronsContext,
  } from "../../../../lib/types/hardware-wallet-neurons.context";
  import {
    mockHardwareWalletNeuronsStore,
    mockNeuronStake,
  } from "../../../mocks/hardware-wallet-neurons.store.mock";
  import {
    SELECTED_ACCOUNT_CONTEXT_KEY,
    SelectedAccountContext,
  } from "../../../../lib/types/selected-account.context";
  import { mockSelectedAccountStore } from "../../../mocks/selected-account.store.mock";

  export let testComponent: typeof SvelteComponent;

  setContext<HardwareWalletNeuronsContext>(
    HARDWARE_WALLET_NEURONS_CONTEXT_KEY,
    {
      store: mockHardwareWalletNeuronsStore,
    }
  );

  setContext<SelectedAccountContext>(SELECTED_ACCOUNT_CONTEXT_KEY, {
    store: mockSelectedAccountStore,
  });
</script>

<svelte:component this={testComponent} neuronId={mockNeuronStake.neuronId} />
