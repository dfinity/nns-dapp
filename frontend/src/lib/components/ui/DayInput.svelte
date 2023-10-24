<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import MaxButton from "$lib/components/common/MaxButton.svelte";
  import InputWithError from "./InputWithError.svelte";
  import MinButton from "$lib/components/common/MinButton.svelte";
  import { daysToSeconds, secondsToDays } from "$lib/utils/date.utils";
  import { nonNullish } from "@dfinity/utils";

  export let seconds: number;
  export let maxInSeconds: number;
  export let placeholderLabelKey = "core.amount";
  export let name = "amount";
  export let getInputError: (value: number) => string | undefined;

  let days: number;
  $: days = secondsToDays(seconds);

  let errorMessage: string | undefined;
  $: errorMessage = getInputError(seconds);

  const update = () => {
    seconds = daysToSeconds(days);
  };

  const dispatch = createEventDispatcher();
  const setMin = () => dispatch("nnsMin");
  const setMax = () => dispatch("nnsMax");
</script>

<InputWithError
  {placeholderLabelKey}
  {name}
  bind:value={days}
  max={secondsToDays(maxInSeconds)}
  inputType="number"
  {errorMessage}
  on:nnsInput={update}
  on:blur={update}
>
  <MinButton on:click={setMin} slot="start" />
  <MaxButton on:click={setMax} slot="end" />
</InputWithError>
