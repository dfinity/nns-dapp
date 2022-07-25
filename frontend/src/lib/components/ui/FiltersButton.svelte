<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import IconFilter from "../../icons/IconFilter.svelte";

  /**
   * How many filters are available and how many are currently active?
   */
  export let totalFilters: number;
  export let activeFilters: number;
  export let testId: string | undefined = undefined;
  const dispatch = createEventDispatcher();
  const filter = () => dispatch("nnsFilter");
</script>

<button data-tid={testId} on:click={filter} class="primary small"
  ><IconFilter /><slot />
  <small>{`(${activeFilters}/${totalFilters})`}</small></button
>

<style lang="scss">
  button {
    display: flex;
    justify-content: center;
    align-items: center;

    :global(svg) {
      margin-right: var(--padding-0_5x);
    }
  }

  small {
    margin: 0 var(--padding-0_5x);
  }
</style>
