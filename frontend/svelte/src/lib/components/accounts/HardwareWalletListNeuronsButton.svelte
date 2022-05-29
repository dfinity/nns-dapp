<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import HardwareWalletListNeuronsModal from "../../modals/accounts/HardwareWalletListNeuronsModal.svelte";
  import { listNeuronsHardwareWalletProxy } from "../../proxy/ledger.services.proxy";
  import { busy, startBusy, stopBusy } from "../../stores/busy.store";
  import { writable } from "svelte/store";
  import { setContext } from "svelte";
  import type {
    HardwareWalletNeuronsContext,
    HardwareWalletNeuronsStore,
  } from "../../types/hardware-wallet-neurons.context";
  import { HARDWARE_WALLET_NEURONS_CONTEXT_KEY } from "../../types/hardware-wallet-neurons.context";
  import type { NeuronInfo } from "@dfinity/nns";
  import { mapHardwareWalletNeuronInfo } from "../../utils/hardware-wallet-neurons.utils";
  import { authStore } from "../../stores/auth.store";
  import { debugHardwareWalletNeuronsStore } from "../../stores/debug.store";

  let modalOpen = false;

  /**
   * A store that contains the neurons of the hardware wallet filled once the user approved listing neurons.
   * We notably need a store because the user can add hotkeys to the neurons that are not yet controlled by NNS-dapp and need to update dynamically the UI accordingly.
   */
  const hardwareWalletNeuronsStore = writable<HardwareWalletNeuronsStore>({
    neurons: [],
  });
  debugHardwareWalletNeuronsStore(hardwareWalletNeuronsStore);

  setContext<HardwareWalletNeuronsContext>(
    HARDWARE_WALLET_NEURONS_CONTEXT_KEY,
    {
      store: hardwareWalletNeuronsStore,
    }
  );

  const listNeurons = async () => {
    startBusy({
      initiator: "accounts",
      labelKey: "busy_screen.pending_approval_hw",
    });

    const { neurons, err } = await listNeuronsHardwareWalletProxy();

    hardwareWalletNeuronsStore.update((data) => ({
      ...data,
      neurons: neurons.map((neuron: NeuronInfo) =>
        mapHardwareWalletNeuronInfo({ neuron, identity: $authStore.identity })
      ),
    }));

    stopBusy("accounts");

    if (err !== undefined) {
      return;
    }

    modalOpen = true;
  };

  const close = () => (modalOpen = false);
</script>

<button
  class="primary small"
  type="button"
  on:click={listNeurons}
  disabled={$busy}
  data-tid="ledger-list-button"
>
  {$i18n.accounts.attach_hardware_show_neurons}
</button>

{#if modalOpen}
  <HardwareWalletListNeuronsModal on:nnsClose={close} />
{/if}
