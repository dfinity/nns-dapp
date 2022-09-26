<script lang="ts">
  import type { E8s, TokenAmount } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { i18n } from "../../stores/i18n";
  import TransactionInfo from "../accounts/TransactionInfo.svelte";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import { Spinner } from "@dfinity/gix-components";

  export let amount: TokenAmount;
  export let source: string;
  export let destinationAddress: string;
  export let loading: boolean = false;
  export let fee: E8s | undefined = undefined;

  const dispatcher = createEventDispatcher();
</script>

<form
  on:submit|preventDefault={() => dispatcher("nnsConfirm")}
  class="wizard-wrapper"
  data-tid="confirm-disburse-screen"
>
  <div class="amount">
    <AmountDisplay inline {amount} />
  </div>

  {#if destinationAddress !== undefined}
    <TransactionInfo {source} destination={destinationAddress} {fee} />
  {/if}

  <button
    class="primary full-width"
    type="submit"
    data-tid="disburse-neuron-button"
  >
    {#if loading}
      <Spinner />
    {:else}
      {$i18n.accounts.confirm_and_send}
    {/if}
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

    --token-font-size: var(--font-size-huge);

    @include modal.header;
  }

  button {
    margin: var(--padding) 0 0;
  }
</style>
