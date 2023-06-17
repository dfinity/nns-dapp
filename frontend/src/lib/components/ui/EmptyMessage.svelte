<p class="description empty" data-tid="empty-message-component"><slot /></p>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .empty {
    @include media.min-width(medium) {
      max-width: 75%;
    }
  }
</style>
