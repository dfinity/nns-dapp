<script lang="ts">
  import { Value, Copy } from "@dfinity/gix-components";

  export let identifier: string;
  export let label: string | undefined = undefined;
  export let showCopy = false;
  export let size: "small" | "medium" = "small";

  let labelText: string;
  $: labelText = label === undefined ? "" : `${label} `;
</script>

<p>
  <span data-tid="identifier" class:text_small={size === "small"}
    >{labelText}<Value>{identifier}</Value></span
  >
  {#if showCopy}
    <Copy value={identifier} />
  {/if}
</p>

<style lang="scss">
  span {
    word-break: break-all;
  }

  p {
    display: flex;
    align-items: center;
  }
</style>
