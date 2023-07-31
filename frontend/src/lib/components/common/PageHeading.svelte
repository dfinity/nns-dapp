<script lang="ts">
  export let testId: string | undefined = undefined;

  let hasTags: boolean;
  $: hasTags = !!$$slots.tag;
</script>

<div class="container" data-tid={testId}>
  <slot name="title" />
  <h4 class="description">
    <slot name="subtitle" />
  </h4>
  {#if hasTags}
    <div class="tags">
      <slot name="tag" />
    </div>
  {/if}
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    gap: var(--padding-1_5x);
    justify-content: center;
    align-items: center;

    width: 100%;

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
