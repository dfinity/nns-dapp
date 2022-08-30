<h2 class="content-cell-title">
  <slot name="start" />
</h2>

<div class="content-cell-details">
  <slot />
</div>

<style lang="scss">
  .content-cell-details {
    margin-bottom: var(--row-gap);
  }
</style>
