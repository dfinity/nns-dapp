<script lang="ts">
  import MaxButton from "$lib/components/common/MaxButton.svelte";
  import { ICP_DISPLAYED_DECIMALS_DETAILED } from "$lib/constants/icp.constants";
  import { i18n } from "$lib/stores/i18n";
  import InputWithError from "./InputWithError.svelte";
  import { isNullish, type Token } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  export let amount: number | undefined = undefined;
  export let max: number | undefined = undefined;
  export let token: Token | undefined = undefined;
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
  decimals={Math.min(
    token?.decimals ?? ICP_DISPLAYED_DECIMALS_DETAILED,
    ICP_DISPLAYED_DECIMALS_DETAILED
  )}
  {errorMessage}
  on:nnsInput={onInput}
>
  <svelte:fragment slot="label">{$i18n.core.amount}</svelte:fragment>
  <MaxButton on:click={setMax} slot="end" />
</InputWithError>
