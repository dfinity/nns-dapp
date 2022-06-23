<script lang="ts">
  export let testId: string | undefined = undefined;
</script>

<section data-tid={testId}>
  <div class="left">
    <slot name="left" />
  </div>
  <div class="right">
    <slot name="right" />
  </div>
</section>

<style lang="scss">
  @use "../../themes/mixins/media";
  section {
    display: flex;
    flex-direction: column;
    gap: var(--row-3x);

    @include media.min-width(large) {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      place-items: stretch;
      column-gap: var(--column-gap);

      .left {
        grid-column-start: 1;
        grid-column-end: 5;
      }

      .right {
        grid-column-start: 7;
        grid-column-end: 12;
      }
    }
  }
</style>
