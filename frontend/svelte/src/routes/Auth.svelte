<script lang="ts">
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { AuthStore, authStore } from "../lib/stores/auth.store";
  import { appPath } from "../lib/utils/route.utils";

  let signedIn: boolean = false;

  // Asks the user to authenticate themselves with a TPM or similar.
  const signIn = async () => {
    try {
      await authStore.signIn();
    } catch (err) {
      // TODO: we display the errors?
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
      const redirectPath: string = `${appPath()}/#/${
        urlParams.get("redirect") || "accounts"
      }`;
      window.location.replace(redirectPath);
    }
  );

  onDestroy(unsubscribe);
</script>

{#if !signedIn}
  <main>
    <img
      src="/assets/assets/nns_background.jpeg"
      loading="lazy"
      role="presentation"
      alt=""
      aria-hidden="true"
      class="background"
    />

    <h1>INTERNET COMPUTER</h1>
    <h2>
      <span class="blue">NETWORK</span> . <span class="pink">NERVOUS</span> .
      <span class="green">SYSTEM</span>
    </h2>
    <img
      src="/assets/assets/ic_colour_logo.svg"
      role="presentation"
      alt="DFINITY logo"
      loading="lazy"
      class="logo"
    />
    <p>
      <span class="green">ICP</span> and <span class="blue">governance</span>
    </p>
    <button on:click={signIn}>LOGIN</button>
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
    grid-template-rows: 105px 40px auto 40px 140px auto;

    > * {
      margin-left: auto;
      margin-right: auto;
      color: var(--gray-400);
      z-index: 1;
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
    font-size: var(--font-size-small);
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
    margin: calc(2 * var(--padding)) auto;
    padding: var(--padding);

    width: 140px;
    height: 55px;

    background: var(--blue-950);
    border-radius: var(--border-radius);

    font-weight: 700;
    letter-spacing: 0.4rem;

    transition: background 0.2s;

    &:hover {
      background: var(--blue-950-tint);
    }
  }
</style>
