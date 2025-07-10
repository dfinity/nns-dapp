<script lang="ts">
  import { IconInfo, Tooltip } from "@dfinity/gix-components";

  type Props = {
    tooltipId?: string;
    tooltipIdPrefix?: string;
    text?: string;
    iconSize?: number;
  };

  const {
    tooltipId,
    text,
    iconSize = 20,
    tooltipIdPrefix = "tooltip-icon",
  }: Props = $props();
</script>

<div class="wrapper" data-tid="tooltip-icon-component">
  <!-- eslint-disable-next-line svelte/no-unused-svelte-ignore -->
  <!-- svelte-ignore slot_element_deprecated -->
  <Tooltip id={tooltipId} idPrefix={tooltipIdPrefix} {text}>
    <IconInfo size={`${iconSize}px`} />
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
