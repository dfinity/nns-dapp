<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  export let testId = "";
</script>

<TestIdWrapper {testId}>
  <div class="content-cell-title">
    <slot name="start" />
  </div>

  <div class="content-cell-details">
    <slot />
  </div>
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .content-cell-details:last-of-type {
    margin-bottom: 0;
  }

  .content-cell-details {
    margin-bottom: 0;

    @include media.min-width(large) {
      margin-bottom: var(--row-gap);
    }
  }
</style>
