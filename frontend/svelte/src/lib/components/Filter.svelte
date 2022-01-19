<script lang="ts">
  import IconExpandMore from "../icons/IconExpandMore.svelte";
  import Chip from "./Chip.svelte";

  export let filters: string[];
</script>

<div>
  <h2><slot /></h2>

  <div class="filters">
    <div class="options">
      {#each filters as filter, i}
        <Chip>{filter}</Chip>
      {/each}
    </div>

    <div class="expand">
      <IconExpandMore />
    </div>
  </div>
</div>

<style lang="scss">
  .filters {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    background: var(--gray-600);

    padding: var(--padding);
    margin-bottom: calc(2 * var(--padding));

    border-radius: var(--border-radius);
  }

  .expand {
    min-width: 30px;
    min-height: 30px;
  }
</style>
