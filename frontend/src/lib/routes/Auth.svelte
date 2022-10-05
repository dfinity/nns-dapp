<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { authStore } from "$lib/stores/auth.store";
  import type { AuthStore } from "$lib/stores/auth.store";
  import { routeStore } from "$lib/stores/route.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError } from "$lib/stores/toasts.store";
  import { displayAndCleanLogoutMsg } from "$lib/services/auth.services";
  import {
    IconWallet,
    IconPsychology,
    IconHowToVote,
  } from "@dfinity/gix-components";
  import { Spinner } from "@dfinity/gix-components";

  let signedIn = false;

  // Asks the user to authenticate themselves with a TPM or similar.
  const signIn = async () => {
    try {
      await authStore.signIn();
    } catch (err: unknown) {
      toastsError({
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
      const redirectPath = `/#/${
        urlParams.get("redirect") ?? "accounts"
      }`;

      // We do not want to push to the browser history but only want to update the url to not have two entries for the same page in the browser stack
      routeStore.replace({ path: redirectPath });
    }
  );

  onMount(() => displayAndCleanLogoutMsg());

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
  <li><IconWallet /> {$i18n.auth.secure}</li>
  <li><IconPsychology /> {$i18n.auth.stake}</li>
  <li><IconHowToVote /> {$i18n.auth.earn}</li>
</ul>

<button
  on:click={signIn}
  data-tid="login-button"
  class="primary"
  disabled={signedIn}
>
  {$i18n.auth.login}
  {#if signedIn}
    <div class="spinner"><Spinner size="small" inline /></div>
  {/if}
</button>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

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

    @include media.min-width(medium) {
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

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    align-self: center;

    width: 100%;
    max-width: 475px;

    @include media.min-width(medium) {
      margin: var(--padding-6x) 0 calc(14 * var(--padding));
      width: auto;
    }

    .spinner {
      margin-left: var(--padding);
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

    @include media.min-width(medium) {
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

    @include media.min-width(medium) {
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
</style>
