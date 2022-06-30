<script lang="ts">
  export let href: string;
  export let selected: boolean = false;
  export let testId: string | undefined = undefined;
</script>

<a role="menuitem" {href} class:selected data-tid={testId}>
  <slot name="icon" />
  <span><slot /></span>
  <slot name="statusIcon" />
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
      color: var(--primary);
      background: inherit;

      &:focus,
      &:hover {
        background: var(--background-shade);
      }
    }

    &:not(.selected):focus,
    &:not(.selected):hover {
      background: var(--background-shade);
    }

    :global(& > :first-child) {
      // preserve icon size
      flex: none;
    }

    :global(:nth-child(3)) {
      margin: 0 var(--padding-2x) 0 auto;
      // preserve icon size
      flex: none;
    }
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    margin: 0 0 0 var(--padding);
  }
</style>
