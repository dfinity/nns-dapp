<script lang="ts">
  import NewTransactionInfo from "./NewTransactionInfo.svelte";
  import ICP from "../ic/ICP.svelte";
  import { ICP as ICPType } from "@dfinity/nns";
  import { NEW_TRANSACTION_CONTEXT_KEY } from "../../stores/transaction.store";
  import type { TransactionContext } from "../../stores/transaction.store";
  import { createEventDispatcher, getContext } from "svelte";
  import { i18n } from "../../stores/i18n";
  import { busy, startBusy, stopBusy } from "../../stores/busy.store";
  import { transferICP } from "../../services/accounts.services";
  import { isHardwareWallet } from "../../utils/accounts.utils";

  const context: TransactionContext = getContext<TransactionContext>(
    NEW_TRANSACTION_CONTEXT_KEY
  );
  const { store }: TransactionContext = context;

  let amount: ICPType = $store.amount ?? ICPType.fromE8s(BigInt(0));

  const dispatcher = createEventDispatcher();

  const executeTransaction = async () => {
    startBusy("accounts");

    const { success } = await transferICP($store);

    stopBusy("accounts");

    // We close the modal in case of success or error if the selected source is not a hardware wallet.
    // In case of hardware wallet, the error messages might contain interesting information for the user such as "your device is idle"
    if (success || !isHardwareWallet($store.selectedAccount)) {
      dispatcher("nnsClose");
    }
  };
</script>

<form on:submit|preventDefault={executeTransaction} class="wizard-wrapper">
  <div class="amount">
    <ICP inline={true} icp={amount} />
  </div>

  <NewTransactionInfo />

  <button class="primary full-width" type="submit" disabled={$busy}>
    {$i18n.accounts.confirm_and_send}
  </button>
</form>

<style lang="scss">
  @use "../../themes/mixins/modal";
  @use "../../themes/mixins/media";

  .amount {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    flex-grow: 1;

    padding: var(--padding) 0;

    @include media.min-width(medium) {
      --icp-font-size: var(--font-size-huge);
      @include modal.header;
    }
  }

  button {
    margin: var(--padding) 0 0;
  }
</style>
