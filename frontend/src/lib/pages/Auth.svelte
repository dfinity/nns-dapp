<script lang="ts">
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { authStore } from "$lib/stores/auth.store";
  import type { AuthStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { i18n } from "$lib/stores/i18n";
  import {
    IconWallet,
    IconPassword,
    IconUsers,
    IconRocketLaunch,
  } from "@dfinity/gix-components";
  import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import {
    buildAccountsUrl,
    buildProposalUrl,
  } from "$lib/utils/navigation.utils";
  import { goto } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";

  let signedIn = false;

  const unsubscribe: Unsubscriber = authStore.subscribe(
    async ({ identity }: AuthStore) => {
      signedIn = isSignedIn(identity);

      if (!signedIn) {
        return;
      }

      // TODO: to be removed
      // Backwards compatibility until the dashboard has migrated to the new query parameters URL
      const { hash } = new URL(window.location.href);
      if (/#\/proposal\/\d+/.test(hash)) {
        const { length, [length - 1]: last } = hash.split("/");
        await goto(
          buildProposalUrl({
            universe: OWN_CANISTER_ID_TEXT,
            proposalId: last,
          }),
          { replaceState: true }
        );
        return;
      }

      await goto(buildAccountsUrl({ universe: OWN_CANISTER_ID_TEXT }), {
        replaceState: true,
      });
    }
  );

  onDestroy(unsubscribe);
</script>

<div class="title">
  <h1>{$i18n.auth.title}&nbsp;<span>{$i18n.auth.on_chain}</span></h1>
</div>

<div class="sign-in">
  <SignIn />
</div>

<ul>
  <li>
    <a href={AppPath.Accounts} data-tid="auth-link-accounts"
      ><IconWallet size="32px" />
      {$i18n.auth.wallet}</a
    >
  </li>
  <li>
    <a href={AppPath.Neurons} data-tid="auth-link-neurons"
      ><IconPassword size="32px" />
      {$i18n.auth.stake}</a
    >
  </li>
  <li>
    <a href={AppPath.Proposals} data-tid="auth-link-proposals"
      ><IconUsers size="32px" />
      {$i18n.auth.earn}</a
    >
  </li>
  <li>
    <a href={AppPath.Launchpad} data-tid="auth-link-launchpad"
      ><IconRocketLaunch size="32px" />
      {$i18n.auth.launchpad}</a
    >
  </li>
</ul>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";
  @use "@dfinity/gix-components/styles/mixins/fonts";

  .title {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: var(--padding-6x);

    @media (min-width: 1024px) and (min-height: 620px) {
      padding-top: 0;
    }
  }

  h1 {
    font-size: inherit;
    line-height: var(--line-height-standard);
    text-align: center;

    letter-spacing: -0.02em;

    color: var(--value-color);

    span {
      display: block;
    }

    display: none;

    @media (min-height: 300px) {
      display: block;
    }

    @media (min-height: 380px) {
      font-size: calc(var(--font-size-h1) * 1.2);
    }

    @media (min-width: 440px) and (min-height: 860px) {
      font-size: calc(var(--font-size-h1) * 2.5);
      line-height: var(--line-height-standard);
    }

    @media (min-width: 1024px) and (min-height: 620px) {
      font-size: calc(var(--font-size-h1) * 3);
      line-height: var(--line-height-standard);
    }
  }

  ul,
  .sign-in {
    max-width: 475px;

    @media (min-width: 1024px) and (min-height: 620px) {
      max-width: inherit;
    }
  }

  ul {
    list-style-type: none;

    padding: 0;
    margin: var(--padding) 0 0;

    grid-template-columns: repeat(2, calc((100% - var(--padding-2x)) / 2));
    grid-column-gap: var(--padding-2x);
    grid-row-gap: var(--padding-2x);

    width: 100%;

    display: none;

    @media (min-height: 620px) {
      display: grid;
    }

    @media (min-width: 1024px) and (min-height: 620px) {
      display: none;
    }

    @media (min-width: 1024px) and (min-height: 720px) {
      display: flex;
      flex-grow: inherit;
      justify-content: center;
      gap: var(--padding-2x);
      padding: var(--padding-4x) 0;
    }
  }

  li {
    @media (min-width: 1024px) and (min-height: 620px) {
      padding: var(--padding-1_5x) 0;
      width: 206px;
    }
  }

  .sign-in {
    width: 100%;
    align-self: center;

    padding: var(--padding-3x) 0;

    :global(button) {
      width: 100%;
      padding: var(--padding) var(--padding-4x);
    }

    @media (min-width: 1024px) and (min-height: 620px) {
      margin: var(--padding-6x) 0 var(--padding);
      width: auto;
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
      text-decoration: underline;
    }

    :global(svg) {
      vertical-align: bottom;
      margin: 0 0 var(--padding);
      color: var(--secondary);
    }
  }

  @include media.light-theme {
    h1 {
      color: inherit;
    }

    a {
      background: linear-gradient(113.27deg, #d5c7eb 0%, #eddcea 100%);
      border: 1px solid var(--line);
      color: var(--text-color);

      :global(svg) {
        color: var(--primary);
      }
    }
  }
</style>
