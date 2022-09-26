<script lang="ts">
  import Banner from "../header/Banner.svelte";
</script>

<div class="container" data-tid="auth-layout">
  <Banner />

  <main data-tid="auth-page">
    <slot />
  </main>
</div>

<style lang="scss">
  @use "../../themes/mixins/img";
  @use "../../themes/mixins/login";
  @use "@dfinity/gix-components/styles/mixins/media";
  @use "@dfinity/gix-components/styles/mixins/display";

  .container {
    position: fixed;
    @include display.inset;

    display: block;

    @include login.background;
  }

  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: transparent;

    padding: var(--padding-6x) var(--padding-4x);

    @include media.min-width(medium) {
      justify-content: center;
      align-items: center;
      max-width: 540px;
      text-align: center;
    }

    @supports (-webkit-touch-callout: none) {
      // webkit-fill-available does not strech to full height
      height: calc(100vh - (12 * var(--padding)));
    }
  }
</style>
