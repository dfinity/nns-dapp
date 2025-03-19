<script lang="ts">
  import NewMaxButton from "$lib/components/common/NewMaxButton.svelte";
  import AmountInputFiatValue from "$lib/components/ui/AmountInputFiatValue.svelte";
  import InputWithError from "$lib/components/ui/InputWithError.svelte";
  import { ICP_DISPLAYED_DECIMALS_DETAILED } from "$lib/constants/icp.constants";
  import { i18n } from "$lib/stores/i18n";
  import { isNullish, nonNullish, type Token } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  export let amount: number | undefined = undefined;
  export let max: number | undefined = undefined;
  export let token: Token;
  export let balance: bigint | undefined = undefined;
  export let errorMessage: string | undefined = undefined;

  let inputAmount: string | undefined = amount?.toString();
  $: inputAmount = amount?.toString();

  const onInput = () => {
    amount = isNullish(inputAmount) ? undefined : +inputAmount;
  };

  const dispatch = createEventDispatcher();
  const setMax = () => dispatch("nnsMax");
</script>

<InputWithError
  testId="amount-input-component"
  placeholderLabelKey="core.amount"
  name="amount"
  bind:value={inputAmount}
  {max}
  inputType="currency"
  decimals={Math.min(token.decimals, ICP_DISPLAYED_DECIMALS_DETAILED)}
  {errorMessage}
  on:nnsInput={onInput}
  {errorMessage}
>
  <span class="label" slot="label">{$i18n.core.amount}</span>

  <NewMaxButton on:click={setMax} slot="inner-end" />

  <div class="bottom" slot="bottom">
    <AmountInputFiatValue
      amount={amount ?? 0}
      {token}
      {balance}
      errorState={nonNullish(errorMessage)}
    />
  </div>
</InputWithError>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .bottom {
    padding: var(--padding-2x);
  }

  .label {
    @include fonts.small();
    color: var(--text-description);
  }
</style>
