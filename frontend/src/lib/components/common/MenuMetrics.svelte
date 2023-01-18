<script lang="ts">
  import TotalValueLocked from "$lib/components/metrics/TotalValueLocked.svelte";
</script>

<div>
  <TotalValueLocked layout="stacked" />
</div>

<style lang="scss">
  div {
    display: flex;
    justify-content: center;

    padding: var(--padding-8x) var(--padding-2x) var(--padding-2x);

    :global(div) {
      max-width: calc(var(--menu-width) - var(--padding-8x));
      word-break: break-all;
    }
  }
</style>
