<script lang="ts">
  import Summary from "$lib/components/summary/Summary.svelte";
</script>

<div class="summary">
  <Summary />
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .summary {
    display: none;

    @include media.min-width(large) {
      display: block;
    }
  }
</style>
