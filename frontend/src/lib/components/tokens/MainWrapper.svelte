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
    height: 100%;
    width: 100%;

    padding: var(--padding-2x) var(--padding-2x) var(--padding)
      var(--padding-2x);

    @include media.min-width(large) {
      padding: var(--padding-4x) 0 0 0;
    }

    & .content {
      width: 100%;
      height: 100%;

      overflow-x: hidden;
      overflow-y: auto;

      @include media.min-width(large) {
        width: var(--island-width);
        max-width: var(--island-max-width);
      }
    }
  }
</style>
