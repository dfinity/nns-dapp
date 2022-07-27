<div>
  <slot />
</div>

<style lang="scss">
  @use "../themes/mixins/modal";
  div {
    @include modal.bottom-buttons;
    padding-top: var(--padding-4x);
  }
</style>
