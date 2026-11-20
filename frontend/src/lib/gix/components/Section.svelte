<script lang="ts">
  import { isNullish } from "@dfinity/utils";
  import type { Snippet } from "svelte";

  interface Props {
    testId?: string;
    description?: Snippet;
    title?: Snippet;
    end?: Snippet;
    children: Snippet;
  }

  let { testId, description, title, end, children }: Props = $props();

  let noDescription = $derived(isNullish(description));
  let noTitle = $derived(isNullish(title) && isNullish(end));
</script>

<div class="container" data-tid={testId}>
  <div class="section-title" class:noDescription class:noTitle>
    {@render title?.()}
    {@render end?.()}
  </div>
  {@render description?.()}
  <div class="content-wrapper" class:noDescription>{@render children()}</div>
</div>

<style lang="scss">
  .container {
    width: 100%;

    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &:not(.noDescription):not(.noTitle) {
      margin-bottom: var(--padding);
    }
  }

  .content-wrapper {
    margin-top: var(--padding-3x);

    &.noDescription {
      margin-top: var(--padding-2x);
    }
  }
</style>
