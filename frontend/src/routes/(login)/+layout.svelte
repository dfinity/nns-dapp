<script lang="ts">
  import Banner from "$lib/components/header/Banner.svelte";
  import { onMount } from "svelte";
  import { initAppAuth } from "$lib/services/$public/app.services";
  import { Layout, ContentBackdrop } from "@dfinity/gix-components";
  import LoginMenuItems from "$lib/components/login/LoginMenuItems.svelte";
  import LoginFooter from "$lib/components/login/LoginFooter.svelte";
  import LoginHeader from "$lib/components/login/LoginHeader.svelte";
  import LoginBackground from "$lib/components/login/LoginBackground.svelte";
  import Warnings from "$lib/components/warnings/Warnings.svelte";
  import LayoutNavGuard from "$lib/components/layout/LayoutNavGuard.svelte";

  onMount(async () => await initAppAuth());
</script>

<LayoutNavGuard spinner>
  <Layout layout="stretch">
    <Banner />

    <LoginMenuItems slot="menu-items" />

    <div class="content">
      <ContentBackdrop />

      <div class="scroll-container">
        <main data-tid="auth-page">
          <LoginHeader />

          <article>
            <LoginBackground />

            <slot />
          </article>

          <LoginFooter />
        </main>
      </div>
    </div>
  </Layout>

  <Warnings bringToastsForward />
</LayoutNavGuard>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "../../lib/themes/mixins/login";

  .content {
    --backdrop-z-index: calc(var(--overlay-z-index) + 5);
    position: relative;

    border-top-left-radius: var(--border-radius-2x);
    border-bottom-left-radius: var(--border-radius-2x);
    overflow: hidden;
    box-sizing: border-box;

    --login-header-height: 70px;

    @include media.min-width(large) {
      --login-header-height: 88px;
    }
  }

  .scroll-container {
    min-width: 100vw;
    height: 100%;

    overflow-x: hidden;
    overflow-y: auto;
  }

  main {
    position: relative;
    max-width: inherit;

    padding: 0;

    @include media.min-width(xlarge) {
      padding: 0 0 var(--login-footer-offset);
    }
  }

  article {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;

    min-height: calc(
      100vh - var(--login-header-height) - var(--padding-8x) - var(--padding-2x)
    );
    width: 100%;

    margin: 0 auto;
    padding: var(--padding-4x);
    box-sizing: border-box;

    position: relative;

    @include media.min-width(large) {
      min-height: auto;
      max-width: calc(1024px - var(--padding-4x));
      text-align: center;
    }

    @include media.min-width(xlarge) {
      max-width: 1300px;
      padding-top: var(--padding-8x);
    }

    @include login.min-size(large) {
      padding-top: calc(var(--login-header-height) + (2 * var(--padding-8x)));
    }
  }
</style>
