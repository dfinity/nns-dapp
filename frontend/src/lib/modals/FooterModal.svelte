<div>
  <slot />
</div>

<style lang="scss">
  @use "../themes/mixins/modal";
  div {
    @include modal.bottom-buttons;
    padding: var(--padding-4x) 0 env(safe-area-inset-bottom, 0);
  }
</style>
