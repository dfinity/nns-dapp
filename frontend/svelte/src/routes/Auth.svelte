<script lang="ts">
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { AuthStore, authStore } from "../lib/stores/auth.store";
  import { routeStore } from "../lib/stores/route.store";

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
    <img
      src="/assets/assets/ic-badge-light.svg"
      role="presentation"
      alt="Powered by IC Banner"
      class="bottom-banner"
      loading="lazy"
    />

  <main>
    <h1>NETWORK NERVOUS SYSTEM</h1>
    <h2>INTERNET COMPUTER</h2>
    <p>ICP and governance</p>
    <button on:click={signIn}>Login</button>
  </main>

{/if}

<style lang="scss">
  @use "../lib/themes/mixins/img";


  main {
    position: absolute;
    bottom: 120px; /* Below is the footer */
    top: 80px; /* For symmetry.  Update: Now we center in the space above the footer.  Might make sense to make a grid in that case rather than abs. */
    margin: auto;
    left: 0;
    right: 0;

    display: grid;
    grid-template-rows: 40px 40px auto 60px;

    background: transparent;
    color: inherit;

    > * {
      margin-left: auto;
      margin-right: auto;
    }
  }
  .bottom-banner {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    margin: auto;
  }

  h1 {
    margin-bottom: 0;
    letter-spacing: 0.1rem;
    align-self: flex-end;
    font-size: 21px; /* Presumably needs to be changed to rem */
    color: white;
  }

  h2 {
    letter-spacing: 0.1rem;

    display: inline-flex;
    align-items: center;

    margin: 0 auto;
    font-size: 16px;

    color: #E5BE5A; /* TODO: This colour is used in the design but is not already defined.  Do we want to use a defined colour instead, or add this to the defined colours? */
  }

  p {
    font-size: 15px;
    font-weight: 20;
    color: #E1E1E1;
    margin: auto;
    margin-bottom: 16px;
  }

  .background {
    @include img.background;
  }

  button {
    --letter-spacing: 0.4rem;

    width: 200px;
    height: 54px;

    background: #2942D5;
    border: solid #2942D5 2px;
    border-radius: 8px;

    font-weight: 700;
    color: white;
    text-indent: 4px; /* The text looks off centre otherwise, although technically it is centred. */

    transition: background 0.2s;

    &:hover {
      border: solid #77F 2px; /* TODO: Get exact colour from A.  TODO: Define colour as a var. */
    }
  }

  @media screen and (min-width: 1025px) {
    main {
      max-height: 324px;
    }
    h1 {
      font-size: 35px; /* Presumably needs to be changed to rem */
    }
    h2 {
      font-size: 32px;
    }
    p {
      font-size: 18px;
      margin-bottom: 20px;
    }
  }

</style>
