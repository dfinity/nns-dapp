<script lang="ts">
  import Copy from "$lib/components/ui/Copy.svelte";
  import { Value } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";

  type Props = {
    identifier: string;
    label?: string;
    showCopy?: boolean;
    size?: "small" | "medium";
  };
  const {
    identifier,
    label,
    showCopy = false,
    size = "small",
  }: Props = $props();
  const labelText = $derived(nonNullish(label) ? `${label}` : "");
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
