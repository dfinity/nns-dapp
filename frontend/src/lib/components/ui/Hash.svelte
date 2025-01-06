<script lang="ts">
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import { Copy, Tooltip } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";

  export let tagName: "h3" | "p" | "span" | "h5" = "h3";
  export let testId: string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let idPrefix: string = "hash";
  export let text: string;
  export let showCopy = false;
  export let className: string | undefined = undefined;
  export let splitLength: number | undefined = undefined;
  export let tooltipTop: boolean | undefined = undefined;
  export let isClickable = false;

  const dispatcher = createEventDispatcher();

  let shortenText: string;
  $: shortenText = shortenWithMiddleEllipsis(text, splitLength);

  const handleClick = (e: MouseEvent) => {
    if (isClickable) {
      e.stopPropagation();
      dispatcher("nnsHash");
    }
  };
</script>

<span data-tid="hash-component">
  <Tooltip top={tooltipTop} {id} {idPrefix} {text}>
    <svelte:element
      this={tagName}
      data-tid={testId}
      class={className}
      role={isClickable ? "button" : undefined}
      on:click={handleClick}
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

    .copy {
      align-items: center;
      display: inline-flex;
      // Make sure the icon doesn't increase the line height.
      max-height: 0;
    }
  }
</style>
