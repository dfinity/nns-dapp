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
  const handleOnClick = (event: MouseEvent) => {
    // Prevents the click event from propagating to the parent elements
    event.preventDefault();
  };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="wrapper" data-tid="tooltip-icon-component" onclick={handleOnClick}>
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
