<script lang="ts">
  export let href: string;
  export let selected = false;
  export let testId: string | undefined = undefined;
  export let rel: string | undefined = undefined;
  export let target: "_blank" | undefined = undefined;
  export let title: string | undefined = undefined;
</script>

<a
  class:selected
  data-tid={testId}
  {href}
  {rel}
  role="menuitem"
  {target}
  {title}
  on:click
>
  <slot name="icon" />
  <span><slot /></span>
  <div><slot name="statusIcon" /></div>
</a>

<style lang="scss">
  @use "../styles/mixins/media";
  @use "../styles/mixins/fonts";

  a {
    display: flex;
    position: relative;
    justify-content: flex-start;
    align-items: center;

    color: var(--menu-color);
    transition: color var(--animation-time-short) ease-in;

    z-index: calc(var(--menu-z-index) + 1);

    @include fonts.h5;

    text-decoration: none;
    outline: none;

    padding: var(--padding);

    &:focus,
    &:hover {
      text-decoration: none;
    }

    &.selected {
      background: var(--menu-selected-background);
      color: var(--menu-select-color);

      border-radius: var(--border-radius) 0 0 var(--border-radius);

      // Fancy corners for selection touches the edge
      &::before {
        content: "";
        position: absolute;

        background-color: transparent;
        right: 0;
        bottom: calc(-2 * var(--menu-selection-outer-radius));
        height: calc(2 * var(--menu-selection-outer-radius));
        width: var(--menu-selection-outer-radius);
        border-top-right-radius: var(--menu-selection-outer-radius);
        box-shadow: 0 calc(-1 * var(--menu-selection-outer-radius)) 0 0
          var(--menu-selected-background);
      }
      &::after {
        content: "";
        position: absolute;

        background-color: transparent;
        right: 0;
        top: calc(-2 * var(--menu-selection-outer-radius));
        height: calc(2 * var(--menu-selection-outer-radius));
        width: var(--menu-selection-outer-radius);
        border-bottom-right-radius: var(--menu-selection-outer-radius);
        box-shadow: 0 var(--menu-selection-outer-radius) 0 0
          var(--menu-selected-background);
      }
    }

    &:not(.selected):focus,
    &:not(.selected):hover {
      color: var(--menu-select-color);
    }

    :global(svg) {
      width: var(--padding-3x);
      min-width: var(--padding-3x);
      height: var(--padding-3x);
    }
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    margin: 0 var(--padding) 0 var(--padding-2x);
  }
</style>
