<header>
  <slot />
</header>

<style lang="scss">
  header {
    position: absolute;
    top: var(--header-offset, 0);
    left: 0;
    right: 0;

    z-index: var(--header-z-index);
    box-shadow: var(--header-box-shadow);

    height: var(--header-height);

    display: block;

    background: var(--primary-gradient-fallback);
    background: var(--primary-gradient);
    color: var(--primary-gradient-contrast);

    --toolbar-pointer-events: all;
  }
</style>
