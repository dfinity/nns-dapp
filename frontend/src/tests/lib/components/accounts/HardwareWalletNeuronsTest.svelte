<script lang="ts">
  import { setContext, SvelteComponent } from "svelte";
  import {
    HARDWARE_WALLET_NEURONS_CONTEXT_KEY,
    type HardwareWalletNeuronsContext,
  } from "../../../../lib/types/hardware-wallet-neurons.context";
  import { mockHardwareWalletNeuronsStore } from "../../../mocks/hardware-wallet-neurons.store.mock";

  export let testComponent: typeof SvelteComponent;

  setContext<HardwareWalletNeuronsContext>(
    HARDWARE_WALLET_NEURONS_CONTEXT_KEY,
    {
      store: mockHardwareWalletNeuronsStore,
    }
  );
</script>

<svelte:component this={testComponent} />
