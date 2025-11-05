<script lang="ts">
  import Copy from "$lib/components/ui/Copy.svelte";
  import { addressToLabelStore } from "$lib/stores/address-book.store";
  import { Tooltip, Value } from "@dfinity/gix-components";
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

  // Check if this identifier has a saved label in the address book
  const addressBookLabel = $derived($addressToLabelStore.get(identifier));
  const labelText = $derived(nonNullish(label) ? `${label} ` : "");
</script>

<p>
  <span data-tid="identifier" class:text_small={size === "small"}
    >{labelText}{#if nonNullish(addressBookLabel)}<span
        class="named-address-container"
      >
        <Tooltip id={`identifier-${identifier}`} text={identifier} center top>
          {addressBookLabel}
        </Tooltip>
      </span>
    {:else}
      <Value>{identifier}</Value>
    {/if}{#if showCopy}
      <Copy value={identifier} />
    {/if}
  </span>
</p>

<style lang="scss">
  span {
    word-break: break-all;
  }

  .named-address-container {
    display: inline-block;
    border-radius: var(--border-radius);
    padding-bottom: var(--padding-0_5x);
    padding-right: var(--padding-1_5x);
    padding-left: var(--padding-1_5x);
    padding-top: var(--padding-0_5x);
    color: var(--description-color);
    background-color: #dadef2;
    font-weight: 450;
  }
  p {
    display: flex;
    align-items: center;
  }
</style>
