<script lang="ts">
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { authStore } from "$lib/stores/auth.store";
  import type { AuthStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { i18n } from "$lib/stores/i18n";
  import {
    IconWallet,
    IconPsychology,
    IconHowToVote,
  } from "@dfinity/gix-components";
  import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import { gotoProxy } from "$lib/proxy/app.services.proxy";
  import { buildUrl } from "$lib/utils/navigation.utils";
  import { AppPath } from "$lib/constants/routes.constants";

  let signedIn = false;

  const unsubscribe: Unsubscriber = authStore.subscribe(
    async ({ identity }: AuthStore) => {
      signedIn = isSignedIn(identity);

      if (!signedIn) {
        return;
      }

      await gotoProxy(
        buildUrl({ path: AppPath.Accounts, universe: OWN_CANISTER_ID_TEXT }),
        { replaceState: true }
      );
    }
  );

  onDestroy(unsubscribe);
</script>

<div class="nns">
  <img
    src="/assets/ic-logo.svg"
    role="presentation"
    alt={$i18n.auth.ic_logo}
    loading="lazy"
  />

  <p class="value">
    <span>{$i18n.auth.ic}</span>
    <span>{$i18n.auth.nns}</span>
  </p>
</div>

<h1>{$i18n.auth.title}&nbsp;<span>{$i18n.auth.on_chain}</span></h1>

<ul>
  <li>
    <IconWallet />
    {$i18n.auth.wallet}
  </li>
  <li>
    <IconPsychology />
    {$i18n.auth.stake}
  </li>
  <li>
    <IconHowToVote />
    {$i18n.auth.earn}
  </li>
</ul>

<div class="sign-in">
  <SignIn />
</div>

<style lang="scss">
  @use "../../../node_modules/@dfinity/gix-components/styles/mixins/media";

  .nns {
    display: flex;
    align-items: center;

    margin: var(--padding) 0 calc(5 * var(--padding));
    gap: var(--padding-2x);

    img {
      height: 32px;
    }

    p {
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      font-size: var(--font-size-ultra-small);
      font-weight: var(--font-weight-bold);
      letter-spacing: 0.1rem;
    }

    @media (min-width: 768px) and (min-height: 620px) {
      justify-content: center;
      flex-direction: column;

      margin: var(--padding) 0 var(--padding-4x);
      gap: var(--padding);

      img {
        height: 38px;
      }

      p {
        font-size: var(--font-size-small);
        align-items: center;
      }
    }
  }

  h1 {
    line-height: 1.4;
    font-size: var(--font-size-h2);
    margin: 0 0 var(--padding-2x);
    max-width: 330px;

    span {
      display: block;
    }

    @media (min-width: 376px) {
      font-size: var(--font-size-h1);
    }

    @media (min-width: 768px) and (min-height: 620px) {
      max-width: 550px;
      font-size: 2.441rem;
    }
  }

  ul {
    flex-grow: 2;
    list-style-type: none;
    padding: 0;
    margin: var(--padding) 0 0;
    font-weight: var(--font-weight-bold);
    letter-spacing: 0.05rem;

    @media (min-width: 768px) and (min-height: 620px) {
      flex-grow: inherit;

      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translate(-50%, 0);
      display: flex;
      width: 100%;
      justify-content: center;
      gap: var(--padding-6x);
      padding: var(--padding-6x);
    }
  }

  @include media.light-theme() {
    ul {
      color: var(--label-color);
    }
  }

  li {
    font-size: var(--font-size-small);
    padding: var(--padding-1_5x) 0;

    :global(svg) {
      height: 24px;
      width: 24px;
      vertical-align: bottom;
      margin: 0 var(--padding-1_5x) 0 0;
      color: var(--primary);
    }
  }

  .sign-in {
    width: 100%;
    max-width: 475px;
    align-self: center;

    :global(button) {
      width: 100%;
    }

    @media (min-width: 768px) and (min-height: 620px) {
      margin: var(--padding-6x) 0 calc(14 * var(--padding));
      width: auto;
    }
  }
</style>
