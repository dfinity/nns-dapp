<script lang="ts">
  import Copy from "./Copy.svelte";
  import Value from "./Value.svelte";

  export let identifier: string;
  export let label: string | undefined = undefined;
  export let showCopy: boolean = false;
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
    margin: 0;
  }
</style>
