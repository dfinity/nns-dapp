<script lang="ts">
  export let testId = "";
</script>

<div class="content-cell" data-tid={testId}>
  <div class="content-cell-title">
    <slot name="start" />
  </div>

  <div class="content-cell-details">
    <slot />
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .content-cell:last-of-type .content-cell-details {
    margin-bottom: 0;
  }

  .content-cell-details {
    margin-bottom: 0;

    @include media.min-width(large) {
      margin-bottom: var(--row-gap);
    }
  }
</style>
