<script lang="ts">
  import { fade } from "svelte/transition";
</script>

<!-- TODO(max): provide a custom duration const FADE_OUT_DURATION = 200 as const; out:fade={{ duration: FADE_OUT_DURATION }}-->
<div class="filters" data-tid="proposals-filters" in:fade out:fade>
  <slot />
</div>

<style lang="scss">
  .filters {
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
