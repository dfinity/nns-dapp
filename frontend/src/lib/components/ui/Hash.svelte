<script lang="ts">
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import { Copy } from "@dfinity/gix-components";
  import Tooltip from "./Tooltip.svelte";
  import { createEventDispatcher } from "svelte";

  export let tagName: "h3" | "p" | "span" | "h5" = "h3";
  export let testId: string | undefined = undefined;
  export let id: string;
  export let text: string;
  export let showCopy = false;
  export let className: string | undefined = undefined;
  export let splitLength: number | undefined = undefined;
  export let tooltipTop: boolean | undefined = undefined;

  const dispatcher = createEventDispatcher();

  let shortenText: string;
  $: shortenText = shortenWithMiddleEllipsis(text, splitLength);

  $: console.log("text", text, shortenText);
</script>

<span data-tid="hash-component">
  <Tooltip top={tooltipTop} {id} {text}>
    <svelte:element
      this={tagName}
      data-tid={testId}
      class={className}
      on:click|stopPropagation={() => dispatcher("nnsTextClick")}
    >
      {shortenText}</svelte:element
    >
  </Tooltip>
  {#if showCopy}
    <div class="copy">
      <Copy value={text} />
    </div>
  {/if}
</span>

<style lang="scss">
  span {
    align-items: center;
    display: inline-flex;
    gap: var(--padding-0_5x);

    .copy {
      align-items: center;
      display: inline-flex;
      // Make sure the icon doesn't increase the line height.
      max-height: 0;
    }
  }
</style>
