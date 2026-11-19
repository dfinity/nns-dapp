<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { handleKeyPress } from "$lib/gix/utils/keyboard.utils";

  export let inputId: string;
  export let checked: boolean;
  export let preventDefault = false;
  export let disabled = false;
  export let text: "block" | "inline" = "inline";
  export let testId: string | undefined = undefined;

  const dispatch = createEventDispatcher();

  /**
   * Emit an event when the checkbox or container is clicked. The state should be updated by consumer.
   */
  const onClick = ($event: MouseEvent | TouchEvent) => {
    if (!disabled) {
      if (preventDefault) {
        $event.preventDefault();
      }

      change();
    }
  };

  const change = () => dispatch("nnsChange");
</script>

<div
  class="checkbox"
  class:disabled
  data-tid={testId}
  role="button"
  tabindex="0"
  on:click|preventDefault={onClick}
  on:keypress={($event) =>
    !disabled && handleKeyPress({ $event, callback: change })}
>
  <label class={text} for={inputId}><slot /></label>
  <input
    id={inputId}
    {checked}
    data-tid="checkbox"
    {disabled}
    tabindex="-1"
    type="checkbox"
    on:click|stopPropagation={onClick}
  />
</div>

<style lang="scss">
  @use "../styles/mixins/text";
  @use "../styles/mixins/interaction";
  @use "../styles/mixins/form";

  .checkbox {
    display: flex;
    justify-content: space-between;
    align-items: var(--checkbox-align-items, center);
    gap: var(--padding);

    height: fit-content;

    padding: var(--checkbox-padding, var(--padding-2x));

    color: var(--checkbox-color);

    @include interaction.tappable;

    font-size: var(--checkbox-font-size, inherit);

    --input-custom-border-color: var(--disable-contrast);

    border: var(--input-border-size) solid transparent;
    outline: none;

    border-radius: var(--checkbox-border-radius, var(--border-radius));

    --checkbox-input-size: 20px;

    &:hover {
      input {
        @include form.input-focus;
      }
    }

    &.disabled {
      pointer-events: none;
    }
  }

  label {
    user-select: none;
    cursor: pointer;

    flex: 1;
    order: var(--checkbox-label-order);

    color: var(--value-color);

    &.inline {
      @include text.truncate;
    }
  }

  /** https://moderncss.dev/pure-css-custom-styled-radio-buttons/ **/
  /** accent-color not supported yet on Safari 😩 **/

  input[type="checkbox"] {
    appearance: none;
    margin: 0;

    width: var(--checkbox-input-size);
    height: var(--checkbox-input-size);

    border-radius: var(--border-radius-0_5x);

    cursor: pointer;

    position: relative;

    box-sizing: border-box;

    @include form.input;

    &[disabled],
    &[disabled]:hover {
      cursor: default;

      &:checked:after {
        border-color: var(--disable-contrast);
      }
    }

    &:checked:after {
      left: 5px;
      top: 1px;
      width: 6px;
      height: 10px;
      border: solid var(--background-contrast);
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
      display: block;
      content: "";
      position: absolute;
      box-sizing: content-box;
    }
  }
</style>
