<script lang="ts">
  import { translate } from "../../utils/i18n.utils";
  export let name: string;
  export let inputType: "number" | "text" = "number";
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

  export let theme: "dark" | "light" = "light";

  const handleInput = ({ currentTarget }: InputEventHandler) =>
    (value =
      inputType === "number" ? +currentTarget.value : currentTarget.value);

  $: step = inputType === "number" ? step ?? "any" : undefined;
  $: autocomplete = inputType !== "number" ? autocomplete ?? "off" : undefined;

  let placeholder: string;
  $: placeholder = translate({ labelKey: placeholderLabelKey });
</script>

<div class={`input-block ${theme} `} class:disabled>
  <input
    data-tid="input-ui-element"
    type={inputType}
    {required}
    {spellcheck}
    {name}
    {step}
    {disabled}
    {value}
    {minLength}
    {placeholder}
    {max}
    {autocomplete}
    on:blur
    on:input={handleInput}
  />

  <span class="placeholder">
    {placeholder}
  </span>

  <slot name="button" />
</div>

<style lang="scss">
  @use "../../themes/mixins/media.scss";

  .input-block {
    position: relative;

    margin-top: var(--padding-2x);
    margin-bottom: var(--input-margin-bottom, var(--padding-2x));
    margin-left: 0;
    margin-right: 0;

    display: flex;
    align-items: center;

    width: var(--input-width);

    :global(button) {
      position: absolute;
      right: var(--padding-2x);
    }

    --disabled-color: var(--gray-100);

    &.disabled {
      color: var(--disabled-color);

      .placeholder {
        color: var(--disabled-color);
      }
    }

    &.dark {
      color: var(--background-contrast);
      background: none;

      --disabled-color: var(--gray-600);

      &.disabled {
        input {
          border: 1px solid var(--disabled-color);
        }

        .placeholder {
          color: var(--disabled-color);
        }
      }

      input {
        background-color: var(--gray-50-background);
        border: 1px solid var(--input-error-color, var(--black));

        &:not(:placeholder-shown) + span.placeholder {
          background-color: var(--gray-50-background);
          color: var(--input-error-color, currentColor);
        }
      }

      .placeholder {
        color: var(--gray-400);
      }
    }
  }

  input {
    width: 100%;

    padding: var(--padding) var(--padding-2x);
    box-sizing: border-box;

    border-radius: calc(4 * var(--border-radius));

    border: 1px solid var(--input-error-color, currentColor);
    outline: none;

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
    color: var(--gray-600);

    /** Space to display fully the caret if field is focused and empty */
    margin-left: 4px;
  }

  .input-block input:not(:placeholder-shown) + span.placeholder {
    transform: scale(0.8) translate(0, calc(-50% - 30px));
    background: #ffffff;

    padding: 0 var(--padding-0_5x);

    @include media.min-width(medium) {
      transform: scale(0.8) translate(0, calc(-50% - 43px));
    }
  }

  input:focus {
    border: 1px solid var(--blue-500);
  }

  input[disabled] {
    cursor: text;
  }

  input::placeholder {
    visibility: hidden;
  }
</style>
