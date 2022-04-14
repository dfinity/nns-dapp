<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { NEW_TRANSACTION_CONTEXT_KEY } from "../../stores/transaction.store";
  import type { TransactionContext } from "../../stores/transaction.store";
  import { getContext } from "svelte";
  import { formattedTransactionFeeICP } from "../../utils/icp.utils";

  const context: TransactionContext = getContext<TransactionContext>(
    NEW_TRANSACTION_CONTEXT_KEY
  );
  const { store }: TransactionContext = context;

  export let feeOnly: boolean = false;
</script>

{#if !feeOnly}
  <h5>{$i18n.accounts.source}</h5>
  <p>{$store.selectedAccount?.identifier ?? ""}</p>

  <h5>{$i18n.accounts.destination}</h5>
  <p>{$store.destinationAddress ?? ""}</p>
{/if}

<h5>{$i18n.accounts.transaction_fee}</h5>

<p class="fee">{formattedTransactionFeeICP()} ICP</p>

<style lang="scss">
  h5 {
    margin: 0;
  }

  p {
    margin: 0 0 var(--padding-0_5x);
    word-wrap: break-word;
  }

  .fee {
    flex-grow: 1;
  }
</style>
