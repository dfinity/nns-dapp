<script lang="ts">
  import { slide } from "svelte/transition";
  import { SHORT_SLIDE_Y_PARAMS } from "$lib/constants/ui-constants";
</script>

<div
  class="filters"
  data-tid="proposals-filters"
  in:slide={SHORT_SLIDE_Y_PARAMS}
  out:slide={SHORT_SLIDE_Y_PARAMS}
>
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
