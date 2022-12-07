<script lang="ts">
  import Banner from "$lib/components/header/Banner.svelte";
  import { onMount } from "svelte";
  import { initAppAuth } from "$lib/services/$public/app.services";
  import { Layout, ExternalLink, IconGitHub } from "@dfinity/gix-components";
  import nnsLogo from "$lib/assets/nns-logo.svg";

  onMount(async () => await initAppAuth());
</script>

<Layout layout="stretch">
  <Banner />

  <header>
    <div class="start">
      <ExternalLink href="https://internetcomputer.org">internetcomputer.org</ExternalLink>
    </div>

    <img
            class="logo-nns"
            src={nnsLogo}
            role="presentation"
            alt="Network Nervous System logo"
            loading="lazy"
    />

    <div class="end">
      <ExternalLink href="https://internetcomputer.org/nns">About</ExternalLink>
      <ExternalLink href="https://dashboard.internetcomputer.org/governance">Voting rewards</ExternalLink>
    </div>
  </header>

  <div slot="menu-items" on:click >Menu</div>

  <main data-tid="auth-page">
    <slot />
  </main>

  <footer>
    <span>© 2022 Internet Computer</span>
    <a class="github" href="https://github.com/dfinity/nns-dapp" rel="noopener noreferrer" alt="Link to NNS-dapp repo on GitHub"><IconGitHub /> GitHub</a>
  </footer>
</Layout>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/display";
  @use "@dfinity/gix-components/styles/mixins/media";
  @use "@dfinity/gix-components/styles/mixins/fonts";

  header {
    width: 100%;
    height: var(--login-header-height);

    display: flex;
    justify-content: center;
    align-items: flex-start;

    box-sizing: border-box;

    padding: 0 var(--padding-8x);

    &::after {
      content: "";

      position: absolute;
      bottom: 0;
      left: 50%;

      transform: translate(-50%, -50%);

      height: 1px;
      width: calc(100% - var(--padding-4x));

      background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 50.85%, rgba(255, 255, 255, 0) 101.34%);
      opacity: 0.5;
    }
  }

  footer {
    display: flex;
    justify-content: space-between;

    box-sizing: border-box;

    padding: var(--padding-4x) var(--padding-8x);

    @include fonts.small;
  }

  @include media.light-theme {
    header::after {
      background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.458333) 50.85%, rgba(255, 255, 255, 0) 101.34%);
      opacity: 0.4;
    }
  }

  .logo-nns {
    height: var(--padding-8x);
  }

  .start, .end {
    padding-top: var(--padding-4x);
    flex: 2;
  }

  .end {
    display: flex;
    gap: var(--padding-4x);
    justify-content: flex-end;
  }

  .github {
    text-decoration: none;

    :global(svg) {
      margin-left: var(--padding);
      vertical-align: bottom;
    }
  }

  .container {
    position: fixed;
    @include display.inset;

    display: block;

    background: var(--body-background);
    color: var(--label-color);
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
      max-width: calc(1024px - var(--padding-4x));
      text-align: center;
      padding-top: calc(var(--login-header-height) + var(--padding-3x));
    }
  }
</style>
