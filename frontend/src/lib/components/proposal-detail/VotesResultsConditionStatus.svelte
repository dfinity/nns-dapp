<script lang="ts">
  import {
    Collapsible,
    IconCheckCircleFill,
    IconCheckCircleV2,
    IconCloseCircleFill,
  } from "@dfinity/gix-components";
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
    status?: "default" | "success" | "failed";
    testId: string;
    title: Snippet;
    toggleContent: (() => void) | undefined;
  };
  let {
    children,
    status = "default",
    testId,
    title,
    toggleContent = $bindable(),
  }: Props = $props();

  let cmp: Collapsible | undefined;

  $effect(() => {
    toggleContent = cmp?.toggleContent;
  });
</script>

<Collapsible expandButton={false} externalToggle bind:this={cmp} wrapHeight>
  {#snippet header()}<div class="wrapper" data-tid={testId}>
      {@render title()}
      <span
        class="icon"
        data-tid={`${testId}-status`}
        data-status={status}
        aria-label={`Condition status: ${status}`}
      >
        {#if status === "default"}
          <span class="default" aria-hidden="true">
            <IconCheckCircleV2 size={20} />
          </span>
        {:else if status === "success"}
          <span class="success" aria-hidden="true">
            <IconCheckCircleFill size={20} />
          </span>
        {:else if status === "failed"}
          <span class="failed" aria-hidden="true">
            <IconCloseCircleFill size={20} />
          </span>
        {/if}
      </span>
    </div>{/snippet}
  {@render children()}
</Collapsible>

<style lang="scss">
  .wrapper {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-grow: 1;

    .icon {
      .default {
        /* TODO: Add to GIX once it is part of the design system */
        color: #bec2d6;
      }
      .success {
        color: var(--positive-emphasis);
      }
      .failed {
        color: var(--negative-emphasis);
      }
    }
  }
</style>
