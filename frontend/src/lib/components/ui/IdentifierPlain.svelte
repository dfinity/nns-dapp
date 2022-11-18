<script lang="ts">
  import { Value, Copy } from "@dfinity/gix-components";

  export let identifier: string;
  export let label: string | undefined = undefined;
  export let showCopy = false;

  let labelText: string;
  $: labelText = label === undefined ? "" : `${label} `;
</script>

<p>
    <span data-tid="identifier"
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
    margin: 0;
    display: flex;
    align-items: center;
  }
</style>
