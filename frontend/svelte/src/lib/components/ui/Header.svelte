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
    overflow: hidden;

    display: block;

    // Fallback
    background: var(--brand-razzmatazz);
    background: linear-gradient(
      90deg,
      var(--brand-sea-buckthorn) 0%,
      var(--brand-flamingo) 25%,
      var(--brand-razzmatazz) 50%,
      var(--brand-meteorite) 75%,
      var(--brand-picton-blue) 100%
    );

    --toolbar-pointer-events: all;
  }
</style>
