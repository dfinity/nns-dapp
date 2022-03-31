<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import IconFilter from "../../icons/IconFilter.svelte";

  /**
   * How many filters are available and how many are currently active?
   */
  export let totalFilters: number;
  export let activeFilters: number;
  export let testId: string | undefined;
  const dispatch = createEventDispatcher();
  const filter = () => dispatch("nnsFilter");
</script>

<button data-tid={testId} on:click={filter} class="dark small"
  ><IconFilter /><slot />
  <small>{`(${activeFilters}/${totalFilters})`}</small></button
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
