<script lang="ts">
  import Copy from "./Copy.svelte";

  export let identifier: string;
  export let label: string | undefined = undefined;
  export let showCopy: boolean = false;
  export let size: "small" | "medium" = "small";

  let labelText: string;
  $: labelText = label === undefined ? "" : `${label} `;
</script>

<p>
  <span data-tid="identifier" class="value" class:text_small={size === "small"}
    >{labelText}<span class="value">{identifier}</span></span
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
