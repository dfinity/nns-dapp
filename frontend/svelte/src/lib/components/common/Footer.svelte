<footer>
  <slot />
</footer>

<style lang="scss">
  @use "../../themes/mixins/media.scss";

  footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;

    height: var(--footer-height);

    will-change: transform;
    pointer-events: none;

    background: var(--footer-background);

    :global(.toolbar) {
      align-items: end;
      margin: 0 auto var(--padding-2x);
    }

    :global(.main) {
      @include media.min-width(xsmall) {
        min-width: 280px;
        max-width: calc(var(--section-max-width) * 0.7);
        width: 100%;
      }

      @include media.min-width(medium) {
        margin-bottom: var(--padding-2x);
        gap: var(--padding-2x);
      }
    }

    :global(button) {
      flex: 1 1;
    }
  }
</style>
