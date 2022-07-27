<div>
  <slot />
</div>

<style lang="scss">
  @use "../../themes/mixins/media";

  div {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--padding-4x);
    grid-auto-rows: minmax(0, max-content);

    @include media.min-width(medium) {
      grid-template-columns: 1fr 1fr;
    }

    @include media.min-width(xlarge) {
      grid-template-columns: 1fr 1fr 1fr;
    }

    :global(article) {
      margin: 0;
    }
  }
</style>
