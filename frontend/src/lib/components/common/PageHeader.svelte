<script lang="ts">
  export let testId: string | undefined = undefined;
</script>

<div class="container" data-tid={testId}>
  <div class="page-header">
    <slot name="start" />
    <slot name="end" />
  </div>
  <div class="navigation">
    <slot name="navigation" />
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .container {
    position: relative;
    display: flex;
    flex-direction: column;

    @include media.min-width(medium) {
      flex-direction: row;
    }
  }

  .page-header {
    flex-grow: 1;
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

  .navigation {
    display: flex;
    align-items: center;

    order: -1;
    align-self: end;

    @include media.min-width(medium) {
      order: initial;
      align-self: auto;
    }
  }
</style>
