<script lang="ts">
  import Input from "$lib/components/ui/Input.svelte";
  import { IconInfo } from "@dfinity/gix-components";

  // Same props as Input
  export let name: string;
  export let inputType: "number" | "text" | "icp" | "currency" = "number";
  export let decimals: number | undefined = undefined;
  export let required = true;
  export let spellcheck: boolean | undefined = undefined;
  export let step: number | "any" | undefined = undefined;
  export let disabled = false;
  export let minLength: number | undefined = undefined;
  export let max: number | undefined = undefined;
  export let errorMessage: string | undefined = undefined;
  let hasError: boolean;
  $: hasError = errorMessage !== undefined;
  export let warningMessage: string | undefined = undefined;
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
  export let autocomplete: "off" | "on" | undefined = undefined;
  export let value: string | number | undefined = undefined;
  export let placeholderLabelKey: string;
  export let showInfo = true;
  export let testId = "input-with-error-compoment";
</script>

<div class="wrapper" data-tid={testId} class:error={hasError}>
  <Input
    {inputType}
    {decimals}
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

  {#if errorMessage || warningMessage}
    <p class="error-message" data-tid="input-error-message">
      <IconInfo />
      <span>
        {errorMessage ?? warningMessage}
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
