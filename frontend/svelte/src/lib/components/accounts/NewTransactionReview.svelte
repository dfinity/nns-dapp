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

    if (!success) {
      return;
    }

    dispatcher("nnsClose");
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

  .amount {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    flex-grow: 1;

    --icp-font-size: var(--font-size-huge);

    @include modal.header;
  }

  button {
    margin: var(--padding) 0 0;
  }
</style>
