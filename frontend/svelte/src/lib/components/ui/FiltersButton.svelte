<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import IconFilter from "../../icons/IconFilter.svelte";

  /**
   * How many filters are available and how many are currently active?
   */
  export let allFilters: number;
  export let activeFilters: number;
  const dispatch = createEventDispatcher();
  const filter = () => dispatch("nnsFilter");
</script>

<button on:click={filter} class="dark small"
  ><IconFilter /><slot />
  <small>{`(${activeFilters}/${allFilters})`}</small></button
>

<style lang="scss">
  button {
    display: flex;
    justify-content: center;
    align-items: center;

    :global(svg) {
      margin-right: calc(var(--padding) / 2);
    }
  }

  small {
    margin: 0 calc(var(--padding) / 2);
  }
</style>
