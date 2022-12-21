<script lang="ts">
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { authStore } from "$lib/stores/auth.store";
  import type { AuthStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import {
    buildAccountsUrl,
    buildProposalUrl,
  } from "$lib/utils/navigation.utils";
  import { goto } from "$app/navigation";
  import LoginLinks from "$lib/components/login/LoginLinks.svelte";
  import LoginTitle from "$lib/components/login/LoginTitle.svelte";

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

<LoginTitle />

<div class="sign-in">
  <div class="sign-in-container">
    <SignIn />
  </div>
</div>

<LoginLinks />

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";
  @use "@dfinity/gix-components/styles/mixins/fonts";
  @use "../themes/mixins/login";

  .sign-in {
    width: 100%;
    @include login.hero-max-width;
    align-self: center;

    padding: var(--padding-3x) 0;

    z-index: var(--z-index);

    :global(button) {
      width: 100%;
      padding: var(--padding) var(--padding-4x);
    }

    @include media.min-width(medium) {
      margin: var(--padding-6x) 0 var(--padding);
      width: auto;
    }
  }

  .sign-in-container {
    box-shadow: 0 0 70px rgba(255, 255, 255, 0.3);
    border-radius: var(--border-radius);
  }

  @include media.light-theme {
    .sign-in-container {
      box-shadow: 0 0 70px rgba(255, 255, 255, 0.7);
    }
  }
</style>
