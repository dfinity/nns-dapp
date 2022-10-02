<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { createEventDispatcher } from "svelte";
  import MaxButton from "../common/MaxButton.svelte";
  import InputWithError from "./InputWithError.svelte";

  export let amount: number | undefined = undefined;
  export let max: number | undefined = undefined;
  export let errorMessage: string | undefined = undefined;

  const dispatch = createEventDispatcher();
  const setMax = () => dispatch("nnsMax");
</script>

<InputWithError
  placeholderLabelKey="core.amount"
  name="amount"
  bind:value={amount}
  {max}
  inputType="icp"
  {errorMessage}
>
  <svelte:fragment slot="label">{$i18n.core.amount}</svelte:fragment>
  <MaxButton on:click={setMax} slot="additional" />
</InputWithError>
