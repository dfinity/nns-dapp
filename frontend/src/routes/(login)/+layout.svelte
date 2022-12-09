<script lang="ts">
  import Banner from "$lib/components/header/Banner.svelte";
  import { onMount } from "svelte";
  import { initAppAuth } from "$lib/services/$public/app.services";
  import {
    Layout,
    ExternalLink,
    IconGitHub,
    MenuButton,
  } from "@dfinity/gix-components";
  import nnsLogo from "$lib/assets/nns-logo.svg";
  import { i18n } from "$lib/stores/i18n";

  onMount(async () => await initAppAuth());
</script>

<Layout layout="stretch">
  <Banner />

  <main data-tid="auth-page">
    <header>
      <div class="start">
        <ExternalLink href="https://internetcomputer.org"
          >internetcomputer.org</ExternalLink
        >

        <MenuButton />
      </div>

      <img
        class="logo-nns"
        src={nnsLogo}
        role="presentation"
        alt={$i18n.auth.logo}
        loading="lazy"
      />

      <div class="end">
        <ExternalLink href="https://internetcomputer.org/nns"
          >{$i18n.auth.about}</ExternalLink
        >
        <ExternalLink href="https://dashboard.internetcomputer.org/governance"
          >{$i18n.auth.voting_rewards}</ExternalLink
        >
      </div>
    </header>

    <article>
      <slot />
    </article>

    <footer>
      <span>{$i18n.auth.copyright}</span>
      <a
        class="github"
        href="https://github.com/dfinity/nns-dapp"
        rel="noopener noreferrer"
        alt="Link to NNS-dapp repo on GitHub"><IconGitHub /> GitHub</a
      >
    </footer>
  </main>
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

      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        #ffffff 50.85%,
        rgba(255, 255, 255, 0) 101.34%
      );
      opacity: 0.5;
    }
  }

  footer {
    display: none;

    @media (min-width: 1024px) and (min-height: 820px) {
      display: flex;
      justify-content: space-between;

      box-sizing: border-box;

      padding: var(--padding-4x) var(--padding-8x);

      @include fonts.small;
    }
  }

  @include media.light-theme {
    header::after {
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.458333) 50.85%,
        rgba(255, 255, 255, 0) 101.34%
      );
      opacity: 0.4;
    }
  }

  .logo-nns {
    height: var(--padding-8x);
  }

  .start,
  .end {
    padding-top: calc(4.5 * var(--padding));
    flex: 2;

    :global(a) {
      display: none;
    }

    @media (min-width: 1024px) and (min-height: 820px) {
      :global(a) {
        display: inline-block;
      }

      :global(button) {
        display: none;
      }
    }

    @include media.min-width(xlarge) {
      :global(button.icon-only) {
        display: inherit;
      }
    }

    @media (min-width: 1300px) and (min-height: 820px) {
      :global(button.icon-only) {
        display: none;
      }
    }
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

  main {
    min-width: 100vw;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    position: relative;
    overflow-y: hidden;

    padding: var(--padding-6x) var(--padding-4x);
  }

  article {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    height: 100%;
    width: 100%;
    max-width: 475px;

    @media (min-width: 1024px) and (min-height: 620px) {
      height: auto;
      max-width: calc(1024px - var(--padding-4x));
      text-align: center;
      padding-top: calc(var(--login-header-height) + var(--padding-3x));
    }
  }
</style>
