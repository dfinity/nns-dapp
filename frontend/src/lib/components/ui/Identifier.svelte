<script lang="ts">
  import { Value, Copy } from "@dfinity/gix-components";
  import Hash from "$lib/components/ui/Hash.svelte";

  export let identifier: string;
  export let label: string | undefined = undefined;
  export let showCopy = false;
  export let size: "small" | "medium" = "small";

  let labelText: string;
  $: labelText = label === undefined ? "" : `${label} `;
</script>

{#if size === "small"}
  <Hash id="identifier" tagName="p" testId="identifier" text={identifier} />
{:else}
  <p>
    <span data-tid="identifier" class:text_small={size === "small"}
      >{labelText}<Value>{identifier}</Value></span
    >
    {#if showCopy}
      <Copy value={identifier} />
    {/if}
  </p>
{/if}

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
