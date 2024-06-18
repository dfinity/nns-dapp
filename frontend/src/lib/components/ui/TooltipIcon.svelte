<script lang="ts">
  import { IconInfo, Tooltip } from "@dfinity/gix-components";

  export let tooltipId: string | undefined;
  export let tooltipIdPrefix = "tooltip-icon";
  export let text: string;
</script>

<div class="wrapper" data-tid="tooltip-icon-component">
  <Tooltip id={tooltipId} idPrefix={tooltipIdPrefix} {text}>
    <IconInfo />
  </Tooltip>
</div>

<style lang="scss">
  .wrapper {
    display: inline-flex;
    align-items: center;
    color: var(--tertiary);
  }
</style>
