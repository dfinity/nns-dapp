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

    background: linear-gradient(
      0deg,
      rgba(var(--gray-50-rgb), 0.2) 10%,
      rgba(var(--gray-50-rgb), 0) 100%
    );
  }
</style>
