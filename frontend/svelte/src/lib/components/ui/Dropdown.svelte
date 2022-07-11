<script lang="ts">
  import IconExpandMore from "../../icons/IconExpandMore.svelte";

  // Do not allow to use objects as values.
  // Ex: in the query/update calls we do, when the object changes, the value is pointing to the old object.
  export let selectedValue: string | undefined = undefined;
  export let name: string;
  export let testId: string | undefined = undefined;
</script>

<div>
  <select bind:value={selectedValue} {name} data-tid={testId}>
    <slot />
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
      width: 100%;

      border-radius: var(--element-border-radius);
      border-style: none;
      box-shadow: var(--box-shadow);

      appearance: none;

      background: var(--card-background);
    }

    .icon {
      position: absolute;
      right: var(--padding-3x);
      top: 0;

      display: flex;
      height: 100%;
      align-items: center;

      pointer-events: none;

      :global(svg) {
        width: 24px;
        height: 24px;
      }
    }
  }
</style>
