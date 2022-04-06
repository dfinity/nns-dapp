<script lang="ts">
  import { getContext } from "svelte";
  import { formattedTransactionFeeICP } from "../../utils/icp.utils";
  import { i18n } from "../../stores/i18n";
  import type { TransactionContext } from "../../stores/transaction.store";
  import { NEW_TRANSACTION_CONTEXT_KEY } from "../../stores/transaction.store";

  const context: TransactionContext = getContext<TransactionContext>(
    NEW_TRANSACTION_CONTEXT_KEY
  );
  const { store }: TransactionContext = context;
</script>

<div class="wizard-wrapper">
  <p>// TODO(L2-430): amount input</p>

  <h5>{$i18n.accounts.source}</h5>
  <p>{$store.selectedAccount?.identifier ?? ""}</p>

  <h5>{$i18n.accounts.destination}</h5>
  <p>{$store.destinationAddress ?? ""}</p>

  <h5>{$i18n.accounts.transaction_fee}</h5>
  <p>{formattedTransactionFeeICP()} ICP</p>
</div>

<style lang="scss">
  h5 {
    margin: 0;
  }

  p {
    margin: 0 0 var(--padding);
    word-wrap: break-word;
  }
</style>
