<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
    tagName?: "span" | "li";
    intent?: "warning" | "success" | "error" | "info";
    size?: "medium" | "large";
    testId?: string;
  }

  let {
    children,
    tagName = "span",
    intent = "info",
    size = "medium",
    testId = "tag",
  }: Props = $props();
</script>

<svelte:element
  this={tagName}
  class={`tag ${size === "large" ? "tag--large" : ""} ${intent}`}
  data-tid={testId}
>
  {@render children()}
</svelte:element>

<style lang="scss">
  .tag {
    // "info" intent is the default
    background-color: var(--tag-background);
    color: var(--tag-text);

    &.success {
      background-color: var(--positive-emphasis);
      color: var(--tag-text-light);
    }

    &.warning {
      background-color: var(--warning-emphasis-light);
      // TODO: Use --warning-emphasis after it's reviewed
      color: var(--orange-200);
    }

    &.error {
      background-color: var(--negative-emphasis-light);
      color: var(--negative-emphasis);
    }
  }
</style>
