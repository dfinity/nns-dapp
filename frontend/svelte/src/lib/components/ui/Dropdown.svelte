<script lang="ts">
  import IconExpandMore from "../../icons/IconExpandMore.svelte";
  import type { SelectOption } from "../../types/common";

  // Do not allow to bind objects, since they are mutable.
  export let value: string;
  export let name: string;
  export let options: SelectOption[];
  export let testId: string | undefined = undefined;
</script>

<div>
  <select bind:value {name} data-tid={testId}>
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
  <span class="icon">
    <IconExpandMore />
  </span>
</div>

<style lang="scss">
  div {
    width: 100%;
    position: relative;

    select {
      padding: var(--padding-2x) var(--padding-3x);
      border-radius: var(--element-border-radius);

      appearance: none;

      width: 100%;
    }

    .icon {
      position: absolute;
      right: var(--padding-3x);
      top: 0;

      display: flex;
      height: 100%;
      align-items: center;

      :global(svg) {
        width: 24px;
        height: 24px;
      }
    }
  }
</style>
