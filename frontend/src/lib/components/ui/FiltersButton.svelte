<script lang="ts">
  import { IconFilter } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";

  /**
   * How many filters are available and how many are currently active?
   */
  export let totalFilters: number;
  export let activeFilters: number;
  export let testId: string | undefined = undefined;
  const dispatch = createEventDispatcher();
  const filter = () => dispatch("nnsFilter");
</script>

<button data-tid={testId} on:click={filter} class="secondary"
  ><IconFilter /><slot />
  <small>{`(${activeFilters}/${totalFilters})`}</small></button
>

<style lang="scss">
  button {
    display: flex;
    justify-content: center;
    align-items: center;
    // Compensate the secondary button border (2px), to ensure alignment with the segment component.
    margin: calc(-1 * var(--button-border-size));
    min-height: auto;

    :global(svg) {
      margin-right: var(--padding-0_5x);
    }
  }

  small {
    margin: 0 var(--padding-0_5x);
  }
</style>
