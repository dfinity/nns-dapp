<script lang="ts">
  import { NEW_TRANSACTION_CONTEXT_KEY } from "$lib/types/transaction.context";
  import type { TransactionContext } from "$lib/types/transaction.context";
  import { getContext } from "svelte";
  import TransactionInfo from "./TransactionInfo.svelte";
  import { isAccountHardwareWallet } from "$lib/utils/accounts.utils";

  const context: TransactionContext = getContext<TransactionContext>(
    NEW_TRANSACTION_CONTEXT_KEY
  );
  const { store }: TransactionContext = context;

  export let feeOnly = false;

  let hardwareWallet = false;
  $: hardwareWallet = isAccountHardwareWallet($store.selectedAccount);
</script>

<TransactionInfo
  {feeOnly}
  source={$store.selectedAccount?.identifier ?? ""}
  destination={$store.destinationAddress ?? ""}
  {hardwareWallet}
/>
