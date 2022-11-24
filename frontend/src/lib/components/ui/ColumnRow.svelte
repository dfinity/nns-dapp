<script lang="ts">
    export let testId: string | undefined;
</script>

<div data-tid={testId}>
    <slot name="start" />
    <slot name="end" />
</div>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";
  @use "@dfinity/gix-components/styles/mixins/display";

  div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    column-gap: var(--padding-2x);

    @include media.min-width(small) {
      @include display.space-between;
      flex-direction: row;

      margin: 0 0 var(--padding);
    }
  }
</style>