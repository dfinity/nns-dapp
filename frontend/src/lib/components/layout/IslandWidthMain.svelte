<script lang="ts">
  export let testId: string | undefined = undefined;
</script>

<main data-tid={testId}>
  <div class="content">
    <slot />
  </div>
</main>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  main {
    display: flex;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    padding-left: 0;
    padding-right: 0;

    & .content {
      width: 100%;

      overflow-x: hidden;
      @include media.min-width(large) {
        width: var(--island-width);
        max-width: var(--island-max-width);
      }
    }
  }
</style>
