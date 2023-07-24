<script lang="ts">
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import { Copy } from "@dfinity/gix-components";
  import Tooltip from "./Tooltip.svelte";

  export let tagName: "h3" | "p" | "span" | "h5" = "h3";
  export let testId: string | undefined = undefined;
  export let id: string;
  export let text: string;
  export let showCopy = false;
  // remove copy icon from the css flow
  export let flowLessCopy = false;
  export let className: string | undefined = undefined;
  export let splitLength: number | undefined = undefined;

  let shortenText: string;
  $: shortenText = shortenWithMiddleEllipsis(text, splitLength);
</script>

<span data-tid="hash-component" class:flowLessCopy>
  <Tooltip {id} {text}>
    <svelte:element this={tagName} data-tid={testId} class={className}>
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
    display: inline-flex;
    gap: var(--padding-0_5x);

    &.flowLessCopy {
      // add padding to the right of the text to make space for the copy icon (button + padding)
      padding-right: calc(var(--padding-4x) + var(--padding-0_5x));
      position: relative;

      // center vertically the copy icon
      .copy {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translate(0, -50%);
      }
    }
  }
</style>
