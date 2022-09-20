<div class="info">
    <slot name="start" />
    <slot name="end" />
</div>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/display";

  .info {
    @include display.space-between;

    margin: 0 0 var(--padding);

    // Global selector for simplicity reason and because this component should be deleted with new design anyway
    :global(> *) {
      max-width: 50%;
    }
  }
</style>