<script lang="ts">
  import Tooltip from "$lib/gix/components/Tooltip.svelte";

  export let id: string | undefined = undefined;
  export let idPrefix: string | undefined = undefined;
  export let text: string | undefined = undefined;
  export let slotText: string | undefined = undefined;
</script>

{#if slotText === undefined}
  <Tooltip {id} {idPrefix} {text}>
    <p>content</p>
  </Tooltip>
{:else}
  <Tooltip {id} {idPrefix}>
    <p>content</p>
    <div slot="tooltip-content">
      {slotText}
    </div>
  </Tooltip>
{/if}
