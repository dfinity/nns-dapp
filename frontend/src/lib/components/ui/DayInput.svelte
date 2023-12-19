<script lang="ts">
  import MaxButton from "$lib/components/common/MaxButton.svelte";
  import InputWithError from "./InputWithError.svelte";
  import MinButton from "$lib/components/common/MinButton.svelte";
  import { daysToSeconds, secondsToDays } from "$lib/utils/date.utils";

  export let seconds: number;
  export let disabled: boolean = false;
  export let maxInSeconds: number;
  export let minInSeconds: number;
  export let placeholderLabelKey = "core.amount";
  export let name = "amount";
  // We don't want to trigger an error message until the input changes.
  // We need to trigger the error on:nnsInput
  // Yet, on:nnsInput is triggered before `seconds` change.
  // And we don't want to expose days outside.
  // That's why we expect the error function, instead of relying on the parent to calculate it based on `seconds`.
  export let getInputError: (value: number) => string | undefined;

  // Round up the first time to not show a lot of decimal places.
  let days: number = Math.min(
    Math.ceil(secondsToDays(seconds)),
    secondsToDays(maxInSeconds)
  );
  $: seconds = daysToSeconds(days);

  let errorMessage: string | undefined;
  const showError = () => {
    // This is called before we update the `seconds` variable
    // The seconds variable is update a line above: `$: seconds = daysToSeconds(days);`
    errorMessage = getInputError(daysToSeconds(days));
  };

  const setMin = () => {
    seconds = minInSeconds;
    days = secondsToDays(seconds);
    showError();
  };

  const setMax = () => {
    seconds = maxInSeconds;
    days = secondsToDays(seconds);
    showError();
  };
</script>

<InputWithError
  {placeholderLabelKey}
  {name}
  bind:value={days}
  max={secondsToDays(maxInSeconds)}
  inputType="number"
  {errorMessage}
  on:nnsInput={showError}
  on:blur={showError}
  {disabled}
>
  <MinButton on:click={setMin} slot="start" {disabled} />
  <MaxButton on:click={setMax} slot="end" {disabled} />
</InputWithError>
