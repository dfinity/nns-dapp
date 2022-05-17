<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import HardwareWalletListNeuronsModal from "../../modals/accounts/HardwareWalletListNeuronsModal.svelte";
  import { listNeuronsHardwareWalletProxy } from "../../proxy/ledger.services.proxy";
  import { busy, startBusy, stopBusy } from "../../stores/busy.store";
  import type { NeuronInfo } from "@dfinity/nns";
  import type {Account} from '../../types/account';

  export let selectedAccount: Account | undefined;

  let modalOpen = false;
  let neurons: NeuronInfo[];

  const listNeurons = async () => {
    startBusy({
      initiator: "accounts",
      labelKey: "busy_screen.pending_approval_hw",
    });

    const { neurons: fetchedNeurons, err } =
      await listNeuronsHardwareWalletProxy();

    neurons = fetchedNeurons;

    stopBusy("accounts");

    if (err !== undefined) {
      return;
    }

    modalOpen = true;
  };

  const close = () => {
    neurons = [];
    modalOpen = false;
  };
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
  <HardwareWalletListNeuronsModal {neurons} {selectedAccount} on:nnsClose={close} on:nnsHotkeyAdded />
{/if}
