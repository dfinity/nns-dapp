<header>
  <slot />
</header>

<style lang="scss">
  header {
    position: absolute;
    top: var(--header-offset, 0);
    left: 0;
    right: 0;

    height: var(--header-height);

    display: block;

    background: var(--header-background-fallback);
    background: var(--header-background);
    color: var(--header-color);

    --toolbar-pointer-events: all;
  }
</style>
