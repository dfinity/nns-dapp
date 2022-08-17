<footer>
  <slot />
</footer>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  footer {
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
      width: 50%;
    }
  }
</style>
