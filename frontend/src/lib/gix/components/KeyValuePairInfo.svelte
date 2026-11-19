<script lang="ts">
  import { nonNullish } from "@dfinity/utils";
  import type { Snippet } from "svelte";
  import Collapsible from "./Collapsible.svelte";
  import KeyValuePair from "./KeyValuePair.svelte";
  import IconInfo from "$lib/gix/icons/IconInfo.svelte";
  import { stopPropagation } from "$lib/gix/utils/event-modifiers.utils";

  interface Props {
    testId?: string;
    alignIconRight?: boolean;
    key: Snippet;
    value: Snippet;
    info: Snippet;
  }

  let {
    testId,
    alignIconRight = false,
    key: infoKey,
    value: infoValue,
    info,
  }: Props = $props();

  let cmp: Collapsible | undefined;
</script>

<Collapsible
  bind:this={cmp}
  expandButton={false}
  externalToggle={true}
  {testId}
>
  {#snippet header()}
    <KeyValuePair>
      {#snippet key()}
        <div class="wrapper">
          {@render infoKey()}
          {#if !alignIconRight}
            <button
              class="icon"
              onclick={stopPropagation(() => cmp?.toggleContent())}
              type="button"
            >
              <IconInfo />
            </button>
          {/if}
        </div>
      {/snippet}

      {#snippet value()}
        {@render infoValue()}
        {#if alignIconRight}
          <button
            class="icon alignIconRight"
            onclick={stopPropagation(() => cmp?.toggleContent())}
            type="button"
          >
            <IconInfo />
          </button>
        {/if}
      {/snippet}
    </KeyValuePair>
  {/snippet}

  <p
    class="description"
    data-tid={nonNullish(testId) ? `${testId}-description` : undefined}
  >
    {@render info()}
  </p>
</Collapsible>

<style lang="scss">
  .wrapper {
    display: flex;
    align-items: center;
    gap: var(--padding);
  }

  .icon {
    color: var(--primary-tint);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;

    &.alignIconRight {
      padding-left: var(--padding-0_5x);
      align-self: start;
    }
  }

  p {
    margin: 0;
  }
</style>
