<script lang="ts">
  import {
    Collapsible,
    IconExpandCircleDown,
    stopPropagation,
  } from "@dfinity/gix-components";
  import { fade } from "svelte/transition";
  import type { Snippet } from "svelte";

  type Props = {
    testId: string;
    children: Snippet;
    start: Snippet;
    end?: Snippet;
  };

  let { testId, children, start, end }: Props = $props();

  let cmp = $state<Collapsible | undefined>(undefined);

  const toggleContent = () => cmp?.toggleContent();
  let expanded = $state(false);
</script>

<div class="container" in:fade>
  <Collapsible
    {testId}
    expandButton={false}
    externalToggle={true}
    bind:this={cmp}
    bind:expanded
    wrapHeight
  >
    {#snippet header()}<div class="header" class:expanded>
        <div class="header-entry">
          <span class="value">
            {@render start()}
          </span>
          <button
            class="icon"
            class:expanded
            onclick={stopPropagation(toggleContent)}
          >
            <IconExpandCircleDown />
          </button>
        </div>

        <div class="header-entry">
          {@render end?.()}
        </div>
      </div>{/snippet}

    {@render children()}
  </Collapsible>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .container {
    padding-bottom: var(--padding-2x);
    border-bottom: 1px solid var(--elements-divider);

    &:last-of-type {
      border-bottom: none;
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    gap: var(--padding);
    width: 100%;

    @include media.min-width(large) {
      padding: 0 var(--padding) 0 0;
    }
  }

  .header-entry {
    display: flex;
    align-items: center;
    gap: var(--padding);
  }

  .icon {
    color: var(--tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;

    transition: transform ease-in var(--animation-time-normal);

    &.expanded {
      transform: rotate(-180deg);
    }
  }
</style>
