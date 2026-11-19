<script lang="ts">
  import { nonNullish } from "@dfinity/utils";
  import IconExpandMore from "$lib/gix/icons/IconExpandMore.svelte";

  // Do not allow to use objects as values.
  // Ex: in the query/update calls we do, when the object changes, the value is pointing to the old object.
  export let selectedValue: string | undefined = undefined;
  export let name: string;
  export let testId: string | undefined = undefined;
  export let disabled = false;

  let showStart: boolean;
  $: showStart = nonNullish($$slots.start);
</script>

<div class="select" data-tid="dropdown-component">
  {#if showStart}
    <div class="start">
      <slot name="start" />
    </div>
  {/if}
  <select
    {name}
    class:offset={showStart}
    data-tid={testId}
    {disabled}
    bind:value={selectedValue}
  >
    <slot />
  </select>
  <span class="icon">
    <IconExpandMore />
  </span>
</div>

<style lang="scss">
  @use "../styles/mixins/form";
  @use "../styles/mixins/text";

  .select {
    position: relative;
    box-sizing: border-box;

    display: flex;
    align-items: center;
    justify-content: space-between;

    border-radius: var(--border-radius);

    width: var(--dropdown-width, auto);

    overflow: hidden;

    @include form.input;

    // Click on <select> does not trigger "focus" on parent div.
    // https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-within
    // Matches an element if the element or any of its descendants are focused.
    &:focus-within {
      @include form.input-focus;
    }

    select {
      width: 100%;
      background: var(--input-background);
      border: none;

      --select-padding-inner-top-bottom: var(
        --select-padding-top-bottom,
        var(--padding-2x)
      );
      padding: var(--select-padding-inner-top-bottom) calc(5 * var(--padding))
        var(--select-padding-inner-top-bottom)
        var(--select-padding-inner-start, var(--padding-2x));

      appearance: none;

      font-size: inherit;
      font-weight: inherit;

      @include text.truncate;

      &.offset {
        --select-padding-inner-start: var(
          --select-padding-start,
          calc(5 * var(--padding))
        );
      }

      &:focus {
        outline: none;
      }
    }

    .icon {
      display: flex;
      height: 100%;
      align-items: center;

      pointer-events: none;

      margin-right: var(--padding-1_5x);

      color: var(--disable-contrast);

      position: absolute;
      right: 0;

      // Size to match the line-height when font-size is 16px
      :global(svg) {
        width: 20px;
        height: 20px;
      }
    }
  }

  .start {
    position: absolute;
    left: 0;

    pointer-events: none;
  }
</style>
