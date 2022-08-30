<div class="content-cell-title">
  <slot name="start" />
</div>

<div class="content-cell-details">
  <slot />
</div>

<style lang="scss">
  .content-cell-details {
    margin-bottom: var(--row-gap);
  }
</style>
