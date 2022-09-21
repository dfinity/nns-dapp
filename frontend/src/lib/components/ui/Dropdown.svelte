<script lang="ts">
  import { IconExpandMore } from "@dfinity/gix-components";

  // Do not allow to use objects as values.
  // Ex: in the query/update calls we do, when the object changes, the value is pointing to the old object.
  export let selectedValue: string | undefined = undefined;
  export let name: string;
  export let testId: string | undefined = undefined;
  export let disabled: boolean = false;
</script>

<div>
  <select {disabled} bind:value={selectedValue} {name} data-tid={testId}>
    <slot />
  </select>
  <span class="icon">
    <IconExpandMore />
  </span>
</div>

<style lang="scss">
  @use "../../themes/mixins/form";
  div {
    @include form.input;

    position: relative;
    box-sizing: border-box;

    display: flex;
    align-items: center;
    justify-content: space-between;

    border-radius: var(--element-border-radius);
    box-shadow: var(--box-shadow);

    padding: var(--padding-2x);

    width: var(--dropdown-width, auto);

    // Click on <select> does not trigger "focus" on parent div.
    // https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-within
    // Matches an element if the element or any of its descendants are focused.
    &:focus-within {
      outline: 2px solid var(--primary);
    }
    select {
      // Needed to keep the clickable area of the dropdown the whole width of the div.
      width: 100%;
      // Apply the width to the content
      box-sizing: content-box;
      // Space for the caret icon.
      padding-right: var(--padding-4x);
      background: var(--card-background);
      border: none;
      border-radius: var(--element-border-radius);

      appearance: none;

      font-size: inherit;

      &:focus {
        outline: none;
      }
    }

    .icon {
      display: flex;
      height: 100%;
      align-items: center;

      pointer-events: none;

      // Place the caret inside the select.
      margin-left: calc(-1 * var(--padding-3x));

      // Size to match the line-height when font-size is 16px
      :global(svg) {
        width: 20px;
        height: 20px;
      }
    }
  }
</style>
