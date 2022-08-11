<script lang="ts">
  import IconInfo from "../../icons/IconInfo.svelte";
  import Input from "./Input.svelte";

  // Same props as Input
  export let name: string;
  export let inputType: "number" | "text" | "icp" = "number";
  export let required: boolean = true;
  export let spellcheck: boolean | undefined = undefined;
  export let step: number | "any" | undefined = undefined;
  export let disabled: boolean = false;
  export let minLength: number | undefined = undefined;
  export let max: number | undefined = undefined;
  export let errorMessage: string | undefined = undefined;
  let error: boolean;
  $: error = errorMessage !== undefined;
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
  export let autocomplete: "off" | "on" | undefined = undefined;
  export let value: string | number | undefined = undefined;
  export let placeholderLabelKey: string;
</script>

<div class="wrapper" class:error>
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
    bind:value
    on:blur
    on:input
  >
    <slot name="label" slot="label" />
    <slot name="additional" slot="additional" />
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
  @use "../../themes/mixins/media";

  .wrapper {
    position: relative;
    width: 100%;
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
