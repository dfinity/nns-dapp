<script lang="ts">
  import { IconInfo } from "@dfinity/gix-components";
  import Input from "./Input.svelte";

  // Same props as Input
  export let name: string;
  export let inputType: "number" | "text" | "icp" = "number";
  export let required = true;
  export let spellcheck: boolean | undefined = undefined;
  export let step: number | "any" | undefined = undefined;
  export let disabled = false;
  export let minLength: number | undefined = undefined;
  export let max: number | undefined = undefined;
  export let errorMessage: string | undefined = undefined;
  let error: boolean;
  $: error = errorMessage !== undefined;
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
  export let autocomplete: "off" | "on" | undefined = undefined;
  export let value: string | number | undefined = undefined;
  export let placeholderLabelKey: string;
  export let showInfo = true;
  export let testId: string | undefined = undefined;

  // replace exponent format (1e-4) w/ plain (0.0001)
  const fixExponentFormat = (): void => {
    // number to toLocaleString doesn't support decimals for values >= ~1e16
    const asString = Number(value).toLocaleString("en", {
      useGrouping: false,
      maximumFractionDigits: 8,
    });

    if (!isNaN(Number(asString))) {
      value = asString;
    }
  };
  $: if (`${value}`.includes("e")) {
    fixExponentFormat();
  }
</script>

<div class="wrapper" data-tid={testId} class:error>
  <Input
    {inputType}
    {required}
    {spellcheck}
    {name}
    {step}
    {disabled}
    {minLength}
    {placeholderLabelKey}
    {max}
    {autocomplete}
    {showInfo}
    bind:value
    on:blur
    on:nnsInput
  >
    <slot name="start" slot="start" />
    <slot name="label" slot="label" />
    <slot name="end" slot="end" />
    <slot name="inner-end" slot="inner-end" />
  </Input>

  {#if error}
    <p class="error-message" data-tid="input-error-message">
      <IconInfo />
      <span>
        {errorMessage}
      </span>
    </p>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .wrapper {
    position: relative;
    width: 100%;

    padding: var(--input-error-wrapper-padding);
  }

  .error {
    --input-margin-bottom: 0;
    --input-error-color: var(--negative-emphasis);
  }

  .error-message {
    font-size: var(--font-size-ultra-smal);

    // To have the same spacing as the input
    border: 1px solid transparent;

    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);

    color: var(--negative-emphasis);

    span {
      color: var(--background-contrast);
    }

    @include media.min-width(medium) {
      padding: 0 var(--padding-2x);
    }
  }
</style>
