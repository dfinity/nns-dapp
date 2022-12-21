<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    IconTokens,
    IconNeurons,
    IconVote,
    IconLaunchpad,
  } from "@dfinity/gix-components";
  import { AppPath } from "$lib/constants/routes.constants";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);
</script>

<ul>
  <li>
    <a
      href={AppPath.Accounts}
      data-tid="auth-link-accounts"
      aria-disabled={signedIn}
      ><IconTokens />
      {$i18n.auth.wallet}</a
    >
  </li>
  <li>
    <a
      href={AppPath.Neurons}
      data-tid="auth-link-neurons"
      aria-disabled={signedIn}
      ><IconNeurons />
      {$i18n.auth.stake}</a
    >
  </li>
  <li>
    <a
      href={AppPath.Proposals}
      data-tid="auth-link-proposals"
      aria-disabled={signedIn}
      ><IconVote />
      {$i18n.auth.earn}</a
    >
  </li>
  <li>
    <a
      href={AppPath.Launchpad}
      data-tid="auth-link-launchpad"
      aria-disabled={signedIn}
      ><IconLaunchpad />
      {$i18n.auth.launchpad}</a
    >
  </li>
</ul>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";
  @use "@dfinity/gix-components/styles/mixins/fonts";
  @use "../../themes/mixins/login";

  ul {
    list-style-type: none;

    padding: 0;
    margin: var(--padding) 0 0;

    grid-template-columns: repeat(2, calc((100% - var(--padding-2x)) / 2));
    grid-column-gap: var(--padding-2x);
    grid-row-gap: var(--padding-2x);

    width: 100%;
    @include login.hero-max-width;

    z-index: var(--z-index);

    display: grid;

    @include media.min-width(large) {
      display: flex;
      flex-grow: inherit;
      justify-content: center;
      gap: var(--padding-2x);
      padding: var(--padding-4x) 0;
      max-width: inherit;
    }
  }

  li {
    @include media.min-width(medium) {
      min-width: 206px;
    }
  }

  a {
    text-decoration: none;
    text-align: center;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    box-sizing: border-box;
    height: 100%;

    padding: var(--padding-3x) var(--padding);

    background: linear-gradient(
      113.27deg,
      #24133c 0%,
      #291641 49.25%,
      #29103c 100%
    );
    color: var(--value-color);
    border: 1px solid #4b3870;

    border-radius: var(--border-radius);

    @include fonts.small;

    &:hover,
    &:active,
    &:focus {
      text-decoration: none;
      background: var(--card-background);
    }

    :global(svg) {
      vertical-align: bottom;
      margin: 0 0 var(--padding);
      color: var(--secondary);
    }

    &[aria-disabled="true"] {
      pointer-events: none;
    }
  }

  @include media.light-theme {
    a {
      --login-links-light-bg: linear-gradient(
        113.27deg,
        #d5c7eb 0%,
        #eddcea 100%
      );
      background: var(--login-links-light-bg);
      border: 1px solid var(--line);
      color: var(--text-color);

      :global(svg) {
        color: var(--primary);
      }

      &:hover,
      &:active,
      &:focus {
        background: var(--background-disable);
      }
    }
  }
</style>
