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
  @use "@dfinity/gix-components/styles/mixins/media";
  @use "@dfinity/gix-components/styles/mixins/display";

  .container {
    position: fixed;
    @include display.inset;

    display: block;

    background: var(--background);
    background: radial-gradient(circle at 50% 100%, black, var(--background));
    background-size: 100% 100%;
  }

  @include media.light-theme() {
    .container {
      background: linear-gradient(135deg, var(--background) 75%, var(--primary) 150%);
    }
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
  }
</style>
