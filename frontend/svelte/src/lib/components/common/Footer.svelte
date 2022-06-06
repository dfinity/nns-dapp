<footer>
  <slot />
</footer>

<style lang="scss">
  footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;

    height: var(--footer-height);

    will-change: transform;
    pointer-events: none;
  }
</style>
