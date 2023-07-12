<script lang="ts">
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import { Copy } from "@dfinity/gix-components";
  import Tooltip from "./Tooltip.svelte";

  export let tagName: "h3" | "p" | "span" | "h5" = "h3";
  export let testId: string | undefined = undefined;
  export let id: string;
  export let text: string;
  export let showCopy = false;
  export let className: string | undefined = undefined;
  export let splitLength: number | undefined = undefined;

  let shortenText: string;
  $: shortenText = shortenWithMiddleEllipsis(text, splitLength);
</script>

<span data-tid="hash-component">
  <Tooltip {id} {text}>
    <svelte:element this={tagName} data-tid={testId} class={className}>
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
