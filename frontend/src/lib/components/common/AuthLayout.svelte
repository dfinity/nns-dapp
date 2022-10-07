<script lang="ts">
  import Banner from "$lib/components/header/Banner.svelte";
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
    height: 100%;
    background: transparent;
    overflow-y: auto;

    padding: var(--padding-6x) var(--padding-4x);

    @media (min-width: 768px) and (min-height: 620px) {
      justify-content: center;
      align-items: center;
      max-width: 540px;
      text-align: center;
    }
  }
</style>
