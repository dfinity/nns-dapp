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
    toggleContent: () => void;
  };
  let {
    children,
    status = "default",
    testId,
    title,
    toggleContent = $bindable(),
  }: Props = $props();
</script>

<Collapsible
  expandButton={false}
  externalToggle={true}
  bind:toggleContent
  wrapHeight
>
  <div slot="header" class="wrapper" data-tid={testId}>
    {@render title()}

    {#if status === "default"}
      <span class="icon default" data-tid="vote-result-condition-default-icon">
        <IconCheckCircleV2 size={20} />
      </span>
    {:else if status === "success"}
      <span class="icon success" data-tid="vote-result-condition-success-icon">
        <IconCheckCircleFill size={20} />
      </span>
    {:else if status === "failed"}
      <span class="icon failed" data-tid="vote-result-condition-failed-icon">
        <IconCloseCircleFill size={20} />
      </span>
    {/if}
  </div>
  {@render children()}
</Collapsible>

<style lang="scss">
  .wrapper {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-grow: 1;

    .icon.default {
      /* TODO: Add to GIX once it is part of the design system */
      color: #bec2d6;
    }

    .icon.success {
      color: var(--positive-emphasis);
    }

    .icon.failed {
      color: var(--negative-emphasis);
    }
  }
</style>
