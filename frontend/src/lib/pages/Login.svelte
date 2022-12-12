<script lang="ts">
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { authStore } from "$lib/stores/auth.store";
  import type { AuthStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { i18n } from "$lib/stores/i18n";
  import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import {
    buildAccountsUrl,
    buildProposalUrl,
  } from "$lib/utils/navigation.utils";
  import { goto } from "$app/navigation";
  import LoginLinks from "$lib/components/login/LoginLinks.svelte";

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

<LoginLinks />

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";
  @use "@dfinity/gix-components/styles/mixins/fonts";
  @use "../themes/mixins/login";

  .title {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: var(--padding-6x);

    @include login.min-size(medium) {
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

    @include login.min-size(medium) {
      font-size: calc(var(--font-size-h1) * 3);
      line-height: var(--line-height-standard);
    }
  }

  ul,
  .sign-in {
    max-width: 475px;

    @include login.min-size(medium) {
      max-width: inherit;
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

    @include login.min-size(medium) {
      margin: var(--padding-6x) 0 var(--padding);
      width: auto;
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
