<script lang="ts">
  export let testId: string | undefined = undefined;

  let hasTags: boolean;
  $: hasTags = $$slots.tags !== undefined;
</script>

<div class="container" data-tid={testId}>
  <div class="title-wrapper">
    <slot name="title" />
    <slot name="subtitle" />
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

    .tags {
      display: flex;
      align-items: center;
      gap: var(--padding);
    }
  }
</style>
