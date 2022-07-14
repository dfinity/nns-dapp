<script lang="ts">
  import { translate } from "../../utils/i18n.utils";
  import { isValidICPFormat } from "../../utils/icp.utils";

  // To show undefined as "" (because of the type="text")
  const fixUndefinedValue = (value: string | number | undefined): string =>
    value === undefined ? "" : `${value}`;

  export let name: string;
  export let inputType: "icp" | "number" | "text" = "number";
  export let required: boolean = true;
  export let spellcheck: boolean | undefined = undefined;
  export let step: number | "any" | undefined = undefined;
  export let disabled: boolean = false;
  export let minLength: number | undefined = undefined;
  export let max: number | undefined = undefined;
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
  export let autocomplete: "off" | "on" | undefined = undefined;

  export let value: string | number | undefined = undefined;

  export let placeholderLabelKey: string;

  let inputElement: HTMLInputElement | undefined;

  let selectionStart: number | null = 0;
  let selectionEnd: number | null = 0;

  let icpValue: string = fixUndefinedValue(value);
  let lastValidICPValue: string | number | undefined = value;
  let internalValueChange: boolean = true;

  $: value,
    (() => {
      if (!internalValueChange && inputType === "icp") {
        icpValue = fixUndefinedValue(value);
        lastValidICPValue = icpValue;
      }

      internalValueChange = false;
    })();

  const restoreFromValidValue = (noValue: boolean = false) => {
    if (inputElement === undefined || inputType !== "icp") {
      return;
    }

    if (noValue) {
      lastValidICPValue = undefined;
    }

    internalValueChange = true;
    value =
      lastValidICPValue === undefined
        ? undefined
        : typeof lastValidICPValue === "number"
        ? lastValidICPValue.toFixed(8)
        : +lastValidICPValue;
    icpValue = fixUndefinedValue(lastValidICPValue);

    // force dom update (because no active triggers)
    inputElement.value = icpValue;

    // restore cursor position
    inputElement.setSelectionRange(selectionStart, selectionEnd);
  };

  const handleInput = ({ currentTarget }: InputEventHandler) => {
    if (inputType === "icp") {
      const currentValue = currentTarget.value;

      // handle invalid input
      if (isValidICPFormat(currentValue) === false) {
        // restore value (e.g. to fix invalid paste)
        restoreFromValidValue();
        return;
      }

      // reset to undefined ("" => undefined)
      if (currentValue.length === 0) {
        restoreFromValidValue(true);
        return;
      }

      lastValidICPValue = currentValue;
      icpValue = fixUndefinedValue(currentValue);

      internalValueChange = true;
      // for inputType="icp" value is a number
      // TODO: do we need to fix lost precision for too big for number inputs?
      value = +currentValue;
      return;
    }

    internalValueChange = true;
    value = inputType === "number" ? +currentTarget.value : currentTarget.value;
  };

  const handleKeyDown = () => {
    if (inputElement === undefined) {
      return;
    }

    // preserve selection
    ({ selectionStart, selectionEnd } = inputElement);
  };

  $: step = inputType === "number" ? step ?? "any" : undefined;
  $: autocomplete =
    inputType !== "number" && inputType !== "icp"
      ? autocomplete ?? "off"
      : undefined;

  let placeholder: string;
  $: placeholder = translate({ labelKey: placeholderLabelKey });
</script>

<div class="input-block" class:disabled>
  <div class="info">
    <label for={name}><slot name="label" /></label>
    <slot name="additional" />
  </div>
  <input
    data-tid="input-ui-element"
    type={inputType === "icp" ? "text" : inputType}
    bind:this={inputElement}
    {required}
    {spellcheck}
    {name}
    id={name}
    {step}
    {disabled}
    value={inputType === "icp" ? icpValue : value}
    {minLength}
    {placeholder}
    {max}
    {autocomplete}
    on:blur
    on:focus
    on:input={handleInput}
    on:keydown={handleKeyDown}
  />
</div>

<style lang="scss">
  @use "../../themes/mixins/form";

  .input-block {
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--padding);

    width: var(--input-width);

    --disabled-color: var(--disable-contrast);

    &.disabled {
      color: var(--disabled-color);

      input {
        border: 1px solid var(--disabled-color);
      }
    }

    color: var(--background-contrast);
    background: none;
  }

  .info {
    display: flex;
    justify-content: space-between;
  }

  input {
    @include form.input;
    width: 100%;

    font-size: inherit;

    padding: var(--padding-2x);
    box-sizing: border-box;

    box-shadow: var(--current-box-inset-shadow);

    border-radius: var(--element-border-radius);

    outline: none;
  }

  input:focus {
    border: 1px solid var(--primary);
  }

  input[disabled] {
    cursor: text;
  }
</style>
