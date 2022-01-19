<script lang="ts">
  import IconExpandMore from "../icons/IconExpandMore.svelte";
  import Chip from "./Chip.svelte";
  import { createEventDispatcher } from "svelte";

  export let filters: string[];

  const dispatch = createEventDispatcher();

  const filter = () => dispatch("filter");
</script>

<div>
  <h2><slot /></h2>

  <div class="filter" on:click={filter}>
    <div class="options">
      {#each filters as filter}
        <Chip>{filter}</Chip>
      {/each}
    </div>

    <div class="expand">
      <IconExpandMore />
    </div>
  </div>
</div>

<style lang="scss">
  @use "../themes/mixins/interaction";

  .filter {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    background: var(--gray-600);

    padding: var(--padding);
    margin-bottom: calc(2 * var(--padding));

    border-radius: var(--border-radius);

    @include interaction.tappable;
  }

  .expand {
    min-width: 30px;
    min-height: 30px;
  }
</style>
