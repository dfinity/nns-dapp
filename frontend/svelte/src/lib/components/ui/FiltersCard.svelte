<script lang="ts">
  import IconExpandMore from "../../icons/IconExpandMore.svelte";
  import Chip from "./Chip.svelte";
  import { createEventDispatcher } from "svelte";
  import { i18n } from "../../stores/i18n";

  export let filters: string[];
  export let labelKey: string;

  const dispatch = createEventDispatcher();
  const filter = () => dispatch("nnsFilter");
</script>

<div>
  <h2><slot /></h2>

  <button class="filter" on:click={filter}>
    <div class="options">
      {#each filters as filter}
        <Chip>{$i18n[labelKey]?.[filter] || ""}</Chip>
      {/each}
    </div>

    <div class="expand">
      <IconExpandMore />
    </div>
  </button>
</div>

<style lang="scss">
  .filter {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    width: 100%;

    background: var(--gray-600);

    padding: var(--padding);
    margin-bottom: calc(2 * var(--padding));

    border-radius: var(--border-radius);

    &:active,
    &:focus,
    &:hover {
      background: rgba(var(--light-background-rgb), 0.3);
    }
  }

  .options {
    display: flex;
    flex-wrap: wrap;

    min-height: 45px;
  }

  .expand {
    min-width: 30px;
    min-height: 30px;
  }
</style>
