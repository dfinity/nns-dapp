<div class="split-block">
  <div class="start">
    <slot name="start" />
  </div>
  <hr />
  <div class="end">
    <slot name="end" />
  </div>
</div>

<style lang="scss">
  @use "../styles/mixins/media";

  .split-block {
    display: grid;
    grid-template-rows: auto 1px auto;
    grid-template-columns: auto;
    grid-row-gap: var(--padding-2x);

    @include media.min-width(large) {
      grid-template-columns: 1fr 1px 1fr;
      grid-template-rows: auto;
      grid-row-gap: 0;
      grid-column-gap: var(--padding-2x);
    }
  }

  hr {
    margin: 0;
    height: 1px;
    background: var(--elements-divider);
    border: none;

    @include media.min-width(large) {
      width: 1px;
      height: auto;
    }
  }
</style>
