<script lang="ts">
  import Banner from "../header/Banner.svelte";
  import { i18n } from "../../stores/i18n";
</script>

<div class="container">
  <img
    src="/assets/nns_background.jpeg"
    role="presentation"
    alt=""
    aria-hidden="true"
    class="background"
  />

  <Banner />

  <main data-tid="auth-page">
    <slot />
  </main>

  <img
    src="/assets/100_on_chain-small-centered-white_text.svg"
    role="presentation"
    alt={$i18n.auth.on_chain}
    class="bottom-banner"
    loading="lazy"
  />
</div>

<style lang="scss">
  @use "../../themes/mixins/img";
  @use "../../themes/mixins/media";

  .container {
    position: fixed;
    inset: 0;

    display: block;

    background: black;
  }

  main {
    height: 100%;
    width: 100%;
    max-width: 720px;

    margin: 0 auto;
    padding: 80px 0 120px;

    box-sizing: border-box;

    display: grid;
    grid-template-rows: repeat(2, fit-content(100%)) auto 60px;

    justify-content: center;

    background: transparent;
    color: inherit;

    z-index: 2;
  }

  .background {
    @include img.background;

    z-index: 1;
  }

  .bottom-banner {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translate(-50%, 0);

    z-index: 1;
  }

  @media screen and (min-width: media.$breakpoint-medium) and (min-height: 640px) {
    main {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -46%);

      max-height: 424px;
      padding: 0;
    }
  }
</style>
