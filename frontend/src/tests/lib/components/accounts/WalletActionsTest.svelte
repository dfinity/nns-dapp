<script lang="ts">
    import {setContext, SvelteComponent} from "svelte";
  import {
    HARDWARE_WALLET_NEURONS_CONTEXT_KEY,
    type HardwareWalletNeuronsContext,
  } from "$lib/types/hardware-wallet-neurons.context";
  import { mockHardwareWalletNeuronsStore } from "../../../mocks/hardware-wallet-neurons.store.mock";
  import {
    SELECTED_ACCOUNT_CONTEXT_KEY,
    SelectedAccountContext,
    SelectedAccountStore,
  } from "$lib/types/selected-account.context";
  import type { Account } from "$lib/types/account";
  import { writable } from "svelte/store";

  export let testComponent: typeof SvelteComponent;
  export let account: Account | undefined;

  setContext<HardwareWalletNeuronsContext>(
    HARDWARE_WALLET_NEURONS_CONTEXT_KEY,
    {
      store: mockHardwareWalletNeuronsStore,
    }
  );

  export const selectedAccountStore = writable<SelectedAccountStore>({
    account,
  });

  setContext<SelectedAccountContext>(SELECTED_ACCOUNT_CONTEXT_KEY, {
    store: selectedAccountStore,
  });
</script>

<svelte:component this={testComponent} />
