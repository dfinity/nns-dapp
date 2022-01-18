<script lang="ts">
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { AuthStore, authStore } from "../lib/stores/auth.store";
  import { routeStore } from "../lib/stores/route.store";
  import { i18n } from "../lib/stores/i18n";

  let signedIn: boolean = false;

  // Asks the user to authenticate themselves with a TPM or similar.
  const signIn = async () => {
    try {
      await authStore.signIn();
    } catch (err) {
      // TODO(L2-176): display the errors
      console.error(err);
    }
  };

  const unsubscribe: Unsubscriber = authStore.subscribe(
    async ({ signedIn: loggedIn }: AuthStore) => {
      signedIn = loggedIn === true;

      if (!signedIn) {
        return;
      }

      // Redirect to previous url or default accounts page, user has signed in
      const urlParams: URLSearchParams = new URLSearchParams(
        window.location.search
      );
      const redirectPath: string = `/#/${
        urlParams.get("redirect") || "accounts"
      }`;

      // We do not want to push to the browser history but only want to update the url to not have two entries for the same page in the browser stack
      routeStore.replace({ path: redirectPath });
    }
  );

  onDestroy(unsubscribe);
</script>

{#if !signedIn}
  <img
    src="/assets/assets/nns_background.jpeg"
    loading="lazy"
    role="presentation"
    alt=""
    aria-hidden="true"
    class="background"
  />

  <main>
    <h1>{$i18n.auth.ic}</h1>
    <h2>
      <span class="blue">{$i18n.auth.network}</span> . <span class="pink">{$i18n.auth.nervous}</span> .
      <span class="green">{$i18n.auth.system}</span>
    </h2>
    <img
      src="/assets/assets/ic_colour_logo.svg"
      role="presentation"
      alt={$i18n.auth.logo}
      loading="lazy"
      class="logo"
    />
    <p>
      <span class="green">{$i18n.auth.icp}</span> {$i18n.auth.and} <span class="blue">{$i18n.auth.governance}</span>
    </p>
    <button on:click={signIn}>{$i18n.auth.login}</button>
  </main>
{/if}

<style lang="scss">
  @use "../lib/themes/mixins/img";

  main {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    display: grid;
    grid-template-rows: 105px 40px auto 40px 170px;

    z-index: 1;

    background: transparent;
    color: inherit;

    > * {
      margin-left: auto;
      margin-right: auto;
      color: var(--gray-400);
    }

    @media screen and (min-height: 1025px) {
      top: 50%;
      left: 50%;
      bottom: auto;
      right: auto;
      transform: translate(-50%, -50%);
      height: 594px;
    }
  }

  h1 {
    margin-bottom: 0;
    letter-spacing: 0.3rem;

    align-self: flex-end;
  }

  h2 {
    letter-spacing: 0.4rem;

    display: inline-flex;
    align-items: center;

    margin: 0 auto;
    font-size: var(--font-size-ultra-small);
  }

  p {
    font-size: var(--font-size-small);
    letter-spacing: 0.3rem;
    margin: var(--padding) auto;
  }

  .blue {
    color: var(--blue-350);
  }

  .pink {
    color: var(--pink);
  }

  .green {
    color: var(--green-400);
  }

  .logo {
    width: 7em;
    margin: var(--padding) auto;
  }

  .background {
    @include img.background;
  }

  button {
    --letter-spacing: 0.4rem;

    margin: calc(2 * var(--padding)) auto;
    padding: var(--padding) var(--padding) var(--padding)
      calc(var(--letter-spacing) + var(--padding));

    width: 140px;
    height: 55px;

    background: var(--blue-950);
    border-radius: var(--border-radius);

    font-weight: 700;
    letter-spacing: var(--letter-spacing);

    transition: background 0.2s;

    &:hover {
      background: var(--blue-950-tint);
    }
  }
</style>
