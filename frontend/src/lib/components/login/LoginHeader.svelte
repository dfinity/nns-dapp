<script lang="ts">
  import {
    BREAKPOINT_EXTRA_LARGE,
    ExternalLink,
    MenuButton,
    ThemeToggle,
  } from "@dfinity/gix-components";
  import nnsLogo from "$lib/assets/nns-logo.svg";
  import { i18n } from "$lib/stores/i18n";
  import TotalValueLocked from "$lib/components/metrics/TotalValueLocked.svelte";
  import { ENABLE_METRICS } from "$lib/constants/mockable.constants";

  let innerWidth = 0;
  let displayTvl = false;

  // We have to use JS to activate the TVL metrics in the header or menu to avoid to make calls twice
  // Easier than introducing stores and logic at this point since this can only happen on the login screen.
  $: displayTvl = innerWidth > BREAKPOINT_EXTRA_LARGE && ENABLE_METRICS;
</script>

<svelte:window bind:innerWidth />

<header>
  <div class="start">
    <MenuButton />

    {#if displayTvl}
      <div class="tvl"><TotalValueLocked /></div>
    {/if}
  </div>

  <img
    class="logo-nns"
    src={nnsLogo}
    role="presentation"
    alt={$i18n.auth.logo}
    loading="lazy"
  />

  <div class="end">
    <ExternalLink href="https://dashboard.internetcomputer.org/"
      >{$i18n.auth.dashboard}</ExternalLink
    >
    <ExternalLink href="https://dashboard.internetcomputer.org/governance"
      >{$i18n.auth.voting_rewards}</ExternalLink
    >
    <ThemeToggle />
  </div>
</header>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  header {
    position: relative;

    z-index: var(--z-index);

    width: 100%;
    height: var(--login-header-height);

    display: flex;
    justify-content: center;
    align-items: flex-start;

    box-sizing: border-box;

    padding: 0 var(--padding-2x);

    @include media.min-width(xlarge) {
      padding: 0 var(--padding-8x);
    }

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
    height: var(--padding-6x);

    @include media.min-width(xlarge) {
      padding-top: var(--padding);
    }

    @include media.min-width(xlarge) {
      padding-top: 0;
      height: var(--padding-8x);
    }
  }

  .start,
  .end {
    height: 100%;
    display: flex;
    align-items: center;

    flex: 2;

    :global(a),
    :global(.theme-toggle) {
      display: none;
    }

    @include media.min-width(xlarge) {
      :global(a) {
        display: inline-block;

        &:active,
        &:focus,
        &:hover {
          color: var(--menu-select-color);
        }
      }

      :global(.theme-toggle) {
        display: flex;
      }

      :global(button) {
        display: none;
      }
    }
  }

  .end {
    display: flex;
    gap: var(--padding-2x);
    justify-content: flex-end;

    @include media.min-width(xlarge) {
      gap: var(--padding-4x);
    }
  }

  .start {
    gap: var(--padding-2x);

    @include media.min-width(xlarge) {
      gap: var(--padding-4x);
    }
  }
</style>
