<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import MaxButton from "$lib/components/common/MaxButton.svelte";
  import InputWithError from "./InputWithError.svelte";
  import MinButton from "$lib/components/common/MinButton.svelte";

  export let days: number | undefined = undefined;
  export let max: number | undefined = undefined;
  export let errorMessage: string | undefined = undefined;
  export let placeholderLabelKey = "core.amount";
  export let name = "amount";

  const dispatch = createEventDispatcher();
  const setMin = () => dispatch("nnsMin");
  const setMax = () => dispatch("nnsMax");
</script>

<InputWithError
  {placeholderLabelKey}
  {name}
  bind:value={days}
  {max}
  inputType="number"
  {errorMessage}
  on:nnsInput
  on:blur
>
  <MinButton on:click={setMin} slot="start" />
  <MaxButton on:click={setMax} slot="end" />
</InputWithError>
