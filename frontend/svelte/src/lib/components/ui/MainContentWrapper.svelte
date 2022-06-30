<script lang="ts">
  export let sns: boolean = false;
</script>

<main class:sns>
  <slot />
</main>

<style lang="scss">
  @use "../../themes/mixins/media";
  main {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;

    &.sns {
      margin: 0 auto;
      padding: var(--padding-4x) var(--padding-2x);
      max-width: 1450px;
      box-sizing: border-box;

      @include media.min-width(medium) {
        padding: var(--padding-4x);
      }
    }
  }
</style>
