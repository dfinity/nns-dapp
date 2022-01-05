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

<div class="auth-expandable">
  {#if !signedIn}
    <div class="auth-overlay">
      <div />
      <h1>INTERNET COMPUTER</h1>
      <h2>
        <span class="blue">NETWORK</span> . <span class="pink">NERVOUS</span> .
        <span class="green">SYSTEM</span>
      </h2>
      <div class="dfinity">
        <img src="/assets/assets/ic_colour_logo.svg" />
      </div>
      <div class="tagline">
        <span class="yellow">ICP</span> and <span class="blue">governance</span>
      </div>
      <button on:click={signIn} class="auth-button">LOGIN</button>
    </div>
  {/if}
</div>

<style>
  .auth-section {
    padding: 1em;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    text-align: right;
    position: fixed;
    top: 0;
    right: 0;
  }

  .auth-button {
    background: white;
    padding: 0 2em;
    border-radius: 60px;
    font-size: 1em;
    line-height: 40px;
    height: 33px;
    outline: 0;
    border: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .auth-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 100;
    background-color: black;
    background-image: url("/assets/assets/nns_background.jpeg");
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    display: grid;
    grid-template-rows: 75px 30px 40px auto 40px 140px auto;
  }
  @media (max-width: 1600px) {
    .auth-overlay {
      background-size: 1600px auto;
    }
  }
  .auth-overlay h1 {
    color: #a19996;
    font-size: var(--font-size-normal);
    letter-spacing: 1ex;
  }
  .auth-overlay h2 {
    font-size: var(--font-size-normal);
    color: #777;
    letter-spacing: 0.5ex;
  }
  .auth-overlay .tagline {
    font-size: var(--font-size-normal);
    letter-spacing: 0.5ex;
    color: #a19996;
  }
  .auth-overlay span.blue {
    color: #2ca8df;
  }
  .auth-overlay span.pink {
    color: #d81c6f;
  }
  .auth-overlay span.green {
    color: #859d44;
  }
  .auth-overlay span.yellow {
    color: #b2b081;
  }

  .auth-overlay > * {
    text-align: center;
    margin-left: auto;
    margin-right: auto;
    color: #e4f0f0;
  }
  .auth-overlay button {
    padding-left: 10px;
    padding-right: 10px;
    width: 140px;
    height: 55px;
    line-height: 55px;
    display: block;
    margin-left: auto;
    margin-right: auto;
    background-color: #141f33;
    border: var(--widget-border);
    border-radius: var(--widget-border-radius-small);
    font-size: 20px;
    color: #aeb7b7;
    letter-spacing: 0.5ex;
  }
  .dfinity img {
    width: 5em;
  }
</style>
