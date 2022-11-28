<script lang="ts">
  import type { TokenAmount } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import TransactionInfo from "$lib/components/accounts/TransactionInfo.svelte";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";

  export let amount: TokenAmount;
  export let fee: TokenAmount | undefined = undefined;
  export let source: string;
  export let destinationAddress: string;
  export let loading = false;
  export let secondaryButtonText: string = $i18n.core.back;

  const dispatcher = createEventDispatcher();
</script>

<form
  on:submit|preventDefault={() => dispatcher("nnsConfirm")}
  data-tid="confirm-disburse-screen"
>
  <div class="amount">
    <AmountDisplay inline {amount} />
  </div>

  <TransactionInfo {source} destination={destinationAddress} {fee} />

  <div class="toolbar">
    <button
      type="button"
      class="secondary"
      on:click={() => dispatcher("nnsBack")}>{secondaryButtonText}</button
    >
    <button
      class="primary"
      type="submit"
      data-tid="disburse-neuron-button"
      disabled={loading}
    >
      {$i18n.accounts.confirm_and_send}
    </button>
  </div>
</form>

<style lang="scss">
  .amount {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    flex-grow: 1;

    --token-font-size: var(--font-size-huge);
  }
</style>
