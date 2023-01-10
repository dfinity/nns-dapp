<script lang="ts">
  import Summary from "$lib/components/summary/Summary.svelte";
</script>

<div class="summary">
  <Summary>
    <slot slot="details" />
  </Summary>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  .summary {
    display: none;

    @include media.min-width(large) {
      display: block;
    }
  }
</style>
