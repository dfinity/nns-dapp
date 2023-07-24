<script lang="ts">
  export let testId: string | undefined = undefined;
</script>

<div class="container" data-tid={testId}>
  <slot name="start" />
  <slot name="end" />
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .container {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
    justify-content: center;
    align-items: center;

    @include media.min-width(medium) {
      flex-direction: row;
      justify-content: space-between;
    }
  }
</style>
