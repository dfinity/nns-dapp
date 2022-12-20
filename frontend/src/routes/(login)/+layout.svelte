<script lang="ts">
  import Banner from "$lib/components/header/Banner.svelte";
  import { onMount } from "svelte";
  import { initAppAuth } from "$lib/services/$public/app.services";
  import { Layout, ContentBackdrop } from "@dfinity/gix-components";
  import LoginMenuItems from "$lib/components/login/LoginMenuItems.svelte";
  import LoginFooter from "$lib/components/login/LoginFooter.svelte";
  import LoginHeader from "$lib/components/login/LoginHeader.svelte";
  import LoginBackground from "$lib/components/login/LoginBackground.svelte";

  onMount(async () => await initAppAuth());
</script>

<Layout layout="stretch">
  <Banner />

  <LoginMenuItems slot="menu-items" />

  <div class="content">
    <ContentBackdrop />

    <LoginBackground />

    <main data-tid="auth-page">
      <LoginHeader />

      <article>
        <slot />
      </article>

      <LoginFooter />
    </main>
  </div>
</Layout>

<style lang="scss">
  @use "../../lib/themes/mixins/login";

  .content {
    --backdrop-z-index: var(--z-index);
    position: relative;

    border-top-left-radius: var(--border-radius-2x);
    border-bottom-left-radius: var(--border-radius-2x);
    overflow: hidden;
    padding: var(--padding) 0 var(--padding);
    box-sizing: border-box;

    --login-header-height: 72px;

    @include login.min-size(large) {
      --login-header-height: 88px;
    }
  }

  main {
    min-width: 100vw;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    position: relative;
    overflow: hidden;

    padding: var(--padding-6x) var(--padding-4x);

    @include login.min-size(medium) {
      padding: 0;
    }
  }

  article {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;

    height: 100%;
    width: 100%;

    z-index: var(--z-index);

    @include login.min-size(medium) {
      height: auto;
      max-width: calc(1024px - var(--padding-4x));
      text-align: center;
      padding-top: calc(var(--login-header-height) + var(--padding-3x));
    }

    @include login.min-size(xlarge) {
      max-width: 70vw;
    }
  }
</style>
