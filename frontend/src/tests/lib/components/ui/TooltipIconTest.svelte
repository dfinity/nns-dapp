<script lang="ts">
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";

  export let tooltipId: string | undefined;
  export let tooltipIdPrefix = "tooltip-icon";
  export let text: string;
</script>

<TooltipIcon {tooltipId} {tooltipIdPrefix}>
  <div data-tid="tooltip-content-slot">
    {text}
  </div>
</TooltipIcon>
