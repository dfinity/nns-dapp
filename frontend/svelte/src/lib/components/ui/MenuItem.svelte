<script lang="ts">
  export let href: string;
  export let selected: boolean = false;
  export let testId: string | undefined = undefined;
</script>

<a role="menuitem" {href} class:selected data-tid={testId}>
  <slot name="icon" />
  <span><slot /></span>
</a>

<style lang="scss">
  @use "../../themes/mixins/media";

  a {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    font-size: var(--font-size-h4);
    font-weight: 700;

    text-decoration: none;
    outline: none;

    padding: var(--padding-2x);

    &.selected {
      background: var(--blue-500);
      color: var(--blue-500-contrast);

      &:focus,
      &:hover {
        background: var(--blue-500-tint);
      }
    }

    &:not(.selected):focus,
    &:not(.selected):hover {
      background: var(--background-tint);
    }
  }

  @include media.light-theme() {
    a.selected {
      color: var(--blue-500);
      background: var(--background-shade);

      &:focus,
      &:hover {
        background: var(--background-shade);
      }
    }
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    /** 24px is the size of the svg **/
    max-width: calc(100% - 24px - var(--padding));

    margin: 0 0 0 var(--padding);
  }
</style>
