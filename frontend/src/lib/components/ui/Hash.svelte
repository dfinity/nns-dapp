<script lang="ts">
  import { firstAndLastDigits } from "$lib/utils/format.utils";
  import { Copy } from "@dfinity/gix-components";
  import { Tooltip } from "@dfinity/gix-components";
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
  export let isClickable: boolean | undefined = undefined;

  const dispatcher = createEventDispatcher();

  let firstAndLastDigitsArray: [string, string];
  $: firstAndLastDigitsArray = firstAndLastDigits(text, splitLength);
</script>

<span data-tid="hash-component">
  <Tooltip top={tooltipTop} {id} {idPrefix} {text}>
    <svelte:element
      this={tagName}
      data-tid={testId}
      class={className}
      role={isClickable ? "button" : undefined}
      on:click|stopPropagation={() => isClickable && dispatcher("nnsHash")}
    >
      {firstAndLastDigitsArray[0]}
      <span class="ellipsis">...</span>
      {firstAndLastDigitsArray[1]}</svelte:element
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
    font-variant: tabular-nums;
    align-items: center;
    display: inline-flex;

    .copy {
      align-items: center;
      display: inline-flex;
      // Make sure the icon doesn't increase the line height.
      max-height: 0;
    }

    .ellipsis {
      font-variant: normal;
    }
  }
</style>
