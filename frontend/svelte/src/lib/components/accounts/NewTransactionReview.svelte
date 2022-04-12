<script lang="ts">
  import NewTransactionInfo from "./NewTransactionInfo.svelte";
  import ICP from "../ic/ICP.svelte";
  import { ICP as ICPType } from "@dfinity/nns";
  import { NEW_TRANSACTION_CONTEXT_KEY } from "../../stores/transaction.store";
  import type { TransactionContext } from "../../stores/transaction.store";
  import { getContext } from "svelte";
  import {i18n} from "../../stores/i18n";

  const context: TransactionContext = getContext<TransactionContext>(
    NEW_TRANSACTION_CONTEXT_KEY
  );
  const { store }: TransactionContext = context;

  let amount: ICPType = $store.amount ?? ICPType.fromE8s(BigInt(0));
</script>

<form class="wizard-wrapper">
  <div class="amount">
    <ICP inline={true} icp={amount} />
  </div>

  <NewTransactionInfo />

  <button class="primary full-width" type="submit">
    {$i18n.accounts.confirm_and_send}
  </button>
</form>

<style lang="scss">
  .amount {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    padding: var(--padding) 0 var(--padding-2x);

    flex-grow: 1;

    --icp-font-size: var(--font-size-huge);
  }

  button {
    margin: var(--padding) 0 0;
  }
</style>
