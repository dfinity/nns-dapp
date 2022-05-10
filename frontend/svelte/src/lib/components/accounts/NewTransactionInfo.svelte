<script lang="ts">
  import { NEW_TRANSACTION_CONTEXT_KEY } from "../../stores/transaction.store";
  import type { TransactionContext } from "../../stores/transaction.store";
  import { getContext } from "svelte";
  import TransactionInfo from "./TransactionInfo.svelte";

  const context: TransactionContext = getContext<TransactionContext>(
    NEW_TRANSACTION_CONTEXT_KEY
  );
  const { store }: TransactionContext = context;

  export let feeOnly: boolean = false;
</script>

<TransactionInfo
  {feeOnly}
  source={$store.selectedAccount?.identifier ?? ""}
  destination={$store.destinationAddress ?? ""}
  hardwareWallet={$store.selectedAccount?.type === "hardwareWallet"}
/>
