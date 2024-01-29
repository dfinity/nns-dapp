<script lang="ts">
  import { IconInfo, Tooltip } from "@dfinity/gix-components";

  export let tooltipId: string;
  export let text: string;
</script>

<div class="wrapper" data-tid="tooltip-icon-component">
  <Tooltip id={tooltipId} {text}>
    <IconInfo />
  </Tooltip>
</div>

<style lang="scss">
  .wrapper {
    display: inline-flex;
    align-items: center;
    color: var(--tertiary);
    margin-left: var(--padding);
  }
</style>
