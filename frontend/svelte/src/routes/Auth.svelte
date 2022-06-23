<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { authStore } from "../lib/stores/auth.store";
  import type { AuthStore } from "../lib/stores/auth.store";
  import { routeStore } from "../lib/stores/route.store";
  import { isSignedIn } from "../lib/utils/auth.utils";
  import { i18n } from "../lib/stores/i18n";
  import { toastsStore } from "../lib/stores/toasts.store";
  import Banner from "../lib/components/header/Banner.svelte";
  import { displayAndCleanLogoutMsg } from "../lib/services/auth.services";

  let signedIn: boolean = false;

  // Asks the user to authenticate themselves with a TPM or similar.
  const signIn = async () => {
    try {
      await authStore.signIn();
    } catch (err: unknown) {
      toastsStore.error({
        labelKey: "error.sign_in",
        err,
      });
    }
  };

  const unsubscribe: Unsubscriber = authStore.subscribe(
    async ({ identity }: AuthStore) => {
      signedIn = isSignedIn(identity);

      if (!signedIn) {
        return;
      }

      // Redirect to previous url or default accounts page, user has signed in
      const urlParams: URLSearchParams = new URLSearchParams(
        window.location.search
      );
      const redirectPath: string = `/#/${
        urlParams.get("redirect") ?? "accounts"
      }`;

      // We do not want to push to the browser history but only want to update the url to not have two entries for the same page in the browser stack
      routeStore.replace({ path: redirectPath });
    }
  );

  onMount(() => displayAndCleanLogoutMsg());

  onDestroy(unsubscribe);
</script>

{#if !signedIn}
  <img
    src="/assets/nns_background.jpeg"
    loading="lazy"
    role="presentation"
    alt=""
    aria-hidden="true"
    class="background"
  />

  <Banner />

  <main data-tid="auth-page">
    <h1>{$i18n.auth.nns}</h1>
    <h2>{$i18n.auth.ic}</h2>
    <p>{$i18n.auth.icp_governance}</p>
    <button on:click={signIn} data-tid="login-button">{$i18n.auth.login}</button
    >
  </main>

  <img
    src="/assets/100_on_chain-small-centered-white_text.svg"
    role="presentation"
    alt={$i18n.auth.on_chain}
    class="bottom-banner"
    loading="lazy"
  />
{/if}

<style lang="scss">
  @use "../lib/themes/mixins/img";
  @use "../lib/themes/mixins/media";

  main {
    height: 100%;
    width: 100%;
    max-width: 720px;

    margin: 0 auto;
    padding: 80px 0 120px;

    box-sizing: border-box;

    display: grid;
    grid-template-rows: repeat(2, fit-content(100%)) auto 60px;

    justify-content: center;

    background: transparent;
    color: inherit;

    z-index: 2;

    > * {
      z-index: 3;
    }
  }

  h1 {
    font-size: var(--font-size-h4);
    line-height: 1.5;

    color: white;
  }

  h2 {
    margin: var(--padding) auto 0;

    font-size: var(--font-size-h5);

    color: #e5be5a; /** TODO: ask designer */
  }

  h1,
  h2 {
    text-align: center;
    letter-spacing: 0.1rem;
  }

  p {
    font-size: 1rem;
    color: #e1e1e1;
    margin: 0 auto 16px;
    align-self: flex-end;
  }

  .background {
    @include img.background;

    z-index: 1;
  }

  .bottom-banner {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translate(-50%, 0);

    z-index: 1;
  }

  button {
    --letter-spacing: 0.4rem;

    width: 200px;
    height: 54px;

    --login-button-color: #2942d5; /** TODO: ask designer */
    --login-button-color-tint: #3e55d9;

    background: var(--login-button-color); /** TODO: ask designer */
    border: 2px solid var(--login-button-color);
    border-radius: var(--border-radius);

    font-weight: 700;
    color: white;
    text-indent: 4px; /* The text looks off centre otherwise, although technically it is centred. */

    transition: background var(--animation-time-normal);

    justify-self: center;

    &:hover,
    &:focus {
      background: var(--login-button-color-tint);
    }
  }

  @media screen and (min-width: media.$breakpoint-medium) and (min-height: 640px) {
    main {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -46%);

      max-height: 424px;
      padding: 0;
    }

    h1 {
      font-size: var(--font-size-h1);
      letter-spacing: 0.3rem;
    }

    h2 {
      font-size: var(--font-size-h2);
    }
  }
</style>
