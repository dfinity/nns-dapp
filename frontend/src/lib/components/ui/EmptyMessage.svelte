<p class="description empty" data-tid="empty-message-component"><slot /></p>

<style lang="scss">
  @use "../../gix/styles/mixins/media";

  .empty {
    @include media.min-width(medium) {
      max-width: 75%;
    }
  }
</style>
