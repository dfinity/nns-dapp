<script lang="ts">
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import { Copy } from "@dfinity/gix-components";
  import Tooltip from "./Tooltip.svelte";

  export let tagName: "h3" | "p" | "span" = "h3";
  export let testId: string | undefined = undefined;
  export let id: string;
  export let text: string;
  export let showCopy = false;

  let shortenText: string;
  $: shortenText = shortenWithMiddleEllipsis(text);
</script>

<span>
  <Tooltip {id} {text}>
    <svelte:element this={tagName} data-tid={testId}>
      {shortenText}</svelte:element
    >
  </Tooltip>
  {#if showCopy}
    <Copy value={text} />
  {/if}
</span>

<style lang="scss">
  span {
    display: inline-flex;
    gap: var(--padding-0_5x);
  }
</style>
