<script lang="ts">
  export let testId: string | undefined = undefined;
</script>

<div class="wrapper" data-tid={testId}>
  <div class="left">
    <slot name="left" />
  </div>
  <div class="right">
    <slot name="right" />
  </div>
</div>

<style lang="scss">
  @use "../../themes/mixins/media";
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--row-gap);
    min-height: 100%;
    width: 100%;

    & .right {
      flex: 1;
    }

    @include media.min-width(large) {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      place-items: stretch;
      column-gap: var(--column-gap);

      .left {
        grid-column-start: 1;
        grid-column-end: 6;
      }

      .right {
        grid-column-start: 7;
        grid-column-end: 13;
      }
    }
  }
</style>
