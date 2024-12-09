<script lang="ts">
  import { IconInfo, Tooltip } from "@dfinity/gix-components";

  export let tooltipId: string | undefined = undefined;
  export let tooltipIdPrefix = "tooltip-icon";
  export let text: string | undefined = undefined;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="wrapper" data-tid="tooltip-icon-component" on:click|preventDefault>
  <Tooltip id={tooltipId} idPrefix={tooltipIdPrefix} {text}>
    <IconInfo />
    <slot slot="tooltip-content" />
  </Tooltip>
</div>

<style lang="scss">
  .wrapper {
    display: inline-flex;
    align-items: center;
    color: var(--tooltip-icon-color, var(--elements-icons));
  }
</style>
