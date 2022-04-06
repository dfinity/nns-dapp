<script lang="ts">
  import NewTransactionInfo from "./NewTransactionInfo.svelte";
  import ICP from "../ic/ICP.svelte";
  import { ICP as ICPType } from "@dfinity/nns";
  import { NEW_TRANSACTION_CONTEXT_KEY } from "../../stores/transaction.store";
  import type { TransactionContext } from "../../stores/transaction.store";
  import { getContext } from "svelte";

  const context: TransactionContext = getContext<TransactionContext>(
    NEW_TRANSACTION_CONTEXT_KEY
  );
  const { store }: TransactionContext = context;

  let amount: ICPType = $store.amount ?? ICPType.fromE8s(BigInt(0));
</script>

<div class="wizard-wrapper">
  <div class="amount">
    <ICP inline={true} icp={amount} />
  </div>

  <NewTransactionInfo />

  <p>// TODO(L2-430): effectively create transaction</p>
</div>

<style lang="scss">
  .amount {
    display: inline-flex;
    justify-content: center;
    padding: var(--padding) 0 calc(2 * var(--padding));
  }
</style>
