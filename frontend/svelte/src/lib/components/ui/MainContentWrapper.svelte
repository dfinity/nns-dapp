<section>
  <slot />
</section>

<style lang="scss">
  @use "../../themes/mixins/media";
  section {
    padding: var(--padding-4x) var(--padding-2x);
    max-width: 1300px;
    box-sizing: border-box;
    height: 100%;

    @include media.min-width(medium) {
      padding: var(--padding-4x);
    }
  }
</style>
