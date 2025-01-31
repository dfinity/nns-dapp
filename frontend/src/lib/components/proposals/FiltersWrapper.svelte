<script lang="ts">
  import { fade } from "svelte/transition";
</script>

<div class="filters" data-tid="proposals-filters" in:fade={{ duration: 150 }}>
  <slot />
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .filters {
    // compensate for the negative margin of the filter buttons
    margin: var(--button-border-size);
    @include media.min-width(medium) {
      margin: 0;
    }

    display: flex;
    flex-wrap: wrap;
    gap: var(--padding);

    --checkbox-flex-direction: row-reverse;
    --checkbox-font-size: var(--font-size-small);

    > :global(div.checkbox) {
      width: fit-content;
      padding: var(--padding) calc(0.75 * var(--padding));
      margin: var(--padding) 0 0;
    }
  }

  :global(section > div.checkbox) {
    margin: 0 0 var(--padding);
  }
</style>
