<script lang="ts">
  import {
    ExternalLink,
    MenuButton,
    ThemeToggle,
  } from "@dfinity/gix-components";
  import nnsLogo from "$lib/assets/nns-logo.svg";
  import { i18n } from "$lib/stores/i18n";
  import TotalValueLocked from "$lib/components/metrics/TotalValueLocked.svelte";
</script>

<header>
  <div class="start">
    <MenuButton />

    <div class="tvl"><TotalValueLocked /></div>
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
    <ThemeToggle />
  </div>
</header>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

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

    @include media.min-width(large) {
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

    @include media.min-width(large) {
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

    @include media.min-width(large) {
      :global(a) {
        display: inline-block;
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

  .tvl {
    display: none;

    @include media.min-width(large) {
      display: block;
    }
  }
</style>
