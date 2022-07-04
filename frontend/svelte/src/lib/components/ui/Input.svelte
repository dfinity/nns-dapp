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
  <input
    data-tid="input-ui-element"
    type={inputType === "icp" ? "text" : inputType}
    bind:this={inputElement}
    {required}
    {spellcheck}
    {name}
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

  <span class="placeholder">
    {placeholder}
  </span>

  <slot name="button" />
</div>

<style lang="scss">
  @use "../../themes/mixins/media";

  .input-block {
    position: relative;

    margin: var(--padding-2x) 0 var(--input-margin-bottom, var(--padding-2x));

    display: flex;
    align-items: center;

    width: var(--input-width);

    :global(button) {
      position: absolute;
      right: var(--padding-2x);
    }

    --disabled-color: var(--disable-contrast);

    &.disabled {
      color: var(--disabled-color);

      .placeholder {
        color: var(--disabled-color);
      }

      input {
        border: 1px solid var(--disabled-color);
      }
    }

    color: var(--background-contrast);
    background: none;

    .placeholder {
      color: rgba(var(--background-contrast-rgb), 0.4);
    }
  }

  input {
    width: 100%;

    padding: var(--padding) var(--padding-2x);
    box-sizing: border-box;

    border-radius: calc(4 * var(--border-radius));

    background-color: var(--background);

    border: 1px solid var(--input-error-color, var(--background-contrast));
    outline: none;

    &:not(:placeholder-shown) + span.placeholder {
      background-color: var(--background);
      color: var(--input-error-color, currentColor);
    }

    @include media.min-width(medium) {
      padding: var(--padding-2x);
      font-size: var(--font-size-h3);
    }
  }

  .placeholder {
    position: absolute;
    top: 50%;
    left: var(--padding-2x);
    transform: translate(0, -50%);

    transition: transform var(--animation-time-normal);
    transform-origin: top left;

    pointer-events: none;

    font-size: var(--font-size-h4);
    color: rgba(var(--background-contrast-rgb), 0.4);

    /** Space to display fully the caret if field is focused and empty */
    margin-left: 4px;
  }

  .input-block input:not(:placeholder-shown) + span.placeholder {
    transform: scale(0.8) translate(0, calc(-50% - 30px));
    background-color: var(--background);

    padding: 0 var(--padding-0_5x);

    @include media.min-width(medium) {
      transform: scale(0.8) translate(0, calc(-50% - 43px));
    }
  }

  input:focus {
    border: 1px solid var(--primary);
  }

  input[disabled] {
    cursor: text;
  }

  input::placeholder {
    visibility: hidden;
    opacity: 0;
  }
</style>
