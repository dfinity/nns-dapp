<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { IconFilter, Spinner } from "@dfinity/gix-components";

  /**
   * How many filters are available and how many are currently active?
   */
  export let totalFilters: number;
  export let activeFilters: number;
  export let testId: string | undefined = undefined;
  export let showSpinner: boolean | undefined = undefined;
  const dispatch = createEventDispatcher();
  const filter = () => dispatch("nnsFilter");
</script>

<button data-tid={testId} on:click={filter} class="secondary">
  <IconFilter />
  <slot />
  {#if showSpinner}
    <span><Spinner size="small" inline /></span>
  {:else}
    <small>
      {`(${activeFilters}/${totalFilters})`}
    </small>
  {/if}
</button>

<style lang="scss">
  button {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--padding-0_5x);
  }

  span {
    display: flex;
    justify-content: center;
    margin-left: var(--padding-0_5x);
  }

  small {
    margin: 0 var(--padding-0_5x);
  }
</style>
