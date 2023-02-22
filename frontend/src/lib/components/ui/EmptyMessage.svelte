<p class="description empty"><slot /></p>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  .empty {
    @include media.min-width(medium) {
      max-width: 75%;
    }
  }
</style>
