<script lang="ts">
  import { nonNullish } from "@dfinity/utils";

  export let testId: string | undefined = undefined;

  let hasTags: boolean;
  $: hasTags = $$slots.tags !== undefined;

  let hasSubtitle: boolean;
  $: hasSubtitle = nonNullish($$slots.subtitle);
</script>

<div class="container" data-tid={testId}>
  <div class="title-wrapper">
    <slot name="title" />
    {#if hasSubtitle}
      <h4 class="description">
        <slot name="subtitle" />
      </h4>
    {/if}
  </div>
  {#if hasTags}
    <div class="tags">
      <slot name="tags" />
    </div>
  {/if}
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
    justify-content: center;
    align-items: center;

    width: 100%;

    .title-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--padding-1_5x);
      justify-content: center;
      align-items: center;
    }

    h4 {
      margin: 0;
      font-weight: normal;
    }

    .tags {
      display: flex;
      align-items: center;
      gap: var(--padding);
    }
  }
</style>
