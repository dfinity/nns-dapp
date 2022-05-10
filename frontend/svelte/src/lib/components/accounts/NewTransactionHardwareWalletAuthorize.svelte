<script lang="ts">
  import HardwareWalletConnectAction from "./HardwareWalletConnectAction.svelte";
  import { busy, startBusy, stopBusy } from "../../stores/busy.store";
  import { transferICP } from "../../services/accounts.services";
  import {
    NEW_TRANSACTION_CONTEXT_KEY,
    type TransactionContext,
  } from "../../stores/transaction.store";
  import { createEventDispatcher, getContext } from "svelte";
  import { i18n } from "../../stores/i18n";

  const context: TransactionContext = getContext<TransactionContext>(
    NEW_TRANSACTION_CONTEXT_KEY
  );
  const { store }: TransactionContext = context;

  const dispatcher = createEventDispatcher();

  const executeTransaction = async () => {
    startBusy("accounts");

    const { success } = await transferICP($store);

    stopBusy("accounts");

    if (!success) {
      // We close the modal only if no error. If the user is using the hardware wallet errors can be hints to what to do - e.g. open the app or unlock the wallet etc.
      return;
    }

    dispatcher("nnsClose");
  };
</script>

<form on:submit|preventDefault={executeTransaction} class="wizard-wrapper">
  <HardwareWalletConnectAction />

  <button class="primary full-width" type="submit" disabled={$busy}>
    {$i18n.accounts.confirm_and_send}
  </button>
</form>
