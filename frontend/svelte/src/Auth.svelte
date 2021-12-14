<script lang="ts">
  import { onMount } from "svelte";
  import { AuthClient } from "@dfinity/auth-client";
  import { AuthSync } from "./AuthSync";

  // Login status
  export let signedIn = false;
  export let principal = "";

  // Signs in, out, round and all about.
  let authClient;
  let identityProvider = process.env.INTERNET_IDENTITY_URL;

  // Check for any change in authentication status and act upon it.
  const checkAuth = async () => {
    const wasSignedIn = signedIn;
    authClient = await AuthClient.create();
    const isAuthenticated = await authClient.isAuthenticated();
    if (wasSignedIn !== isAuthenticated) {
      if (isAuthenticated) {
        onSignIn();
      } else {
        signOut();
      }
    }
  };

  // Synchronise login status across tabs.
  const authSync = new AuthSync(checkAuth);

  // Asks the user to authenticate themselves with a TPM or similar.
  const signIn = async () => {
    await new Promise((resolve, reject) => {
      authClient.login({
        identityProvider,
        onSuccess: () => {
          resolve(null);
        },
        onError: reject,
      });
    });
    onSignIn();
    authSync.onSignIn();
  };

  // Gets a local copy of user data.
  const onSignIn = async () => {
    const identity = authClient.getIdentity();
    principal = identity.getPrincipal().toString();
    signedIn = true;
  };

  // Signs out, erasing all local user data.
  const signOut = async () => {
    await authClient.logout();
    signedIn = false;
    authSync.onSignOut();
    // Ensure that all data is wiped
    // ... if we have unencrypted data in local storage, delete it here.
    // ... wipe data in ephemeral state, but in the next tick allow repaint to finish first.
    setTimeout(() => location.reload(), 100);
  };

  // Sets login status on first load.
  onMount(checkAuth);
</script>

<div class="auth-expandable">
  {#if !signedIn && authClient}
    <div class="auth-overlay">
      <div />
      <h1>the INTERNET COMPUTER</h1>
      <h2>NETWORK NERVOUS SYSTEM</h2>
      <div class="dfinity">
        <img src="/assets/assets/ic_colour_logo.svg" />
      </div>
      <div class="tagline">manage ICP and <span>governance</span> voting</div>
      <button on:click={signIn} class="auth-button">LOGIN</button>
    </div>
  {/if}

  <div class="auth-section">
    {#if signedIn}
      <button on:click={signOut} class="auth-button">Logout</button>
    {/if}
  </div>
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
    display: grid;
    grid-template-rows: 75px 40px 40px auto 40px 140px auto;
  }
  .auth-overlay h1 {
    color: #a19996;
    font-size: var(--font-size-normal);
    letter-spacing: 1ex;
  }
  .auth-overlay h2 {
    background-image: linear-gradient(
      to right,
      #f9a739,
      #ee3e4b,
      #502d89,
      #2b8ae0
    );
    font-size: var(--font-size-normal);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    letter-spacing: 0.5ex;
  }
  .auth-overlay .tagline {
    background-image: linear-gradient(
      to right,
      #a19996,
      #75715a,
      #a19996,
      #a19996
    );
    font-size: var(--font-size-normal);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    letter-spacing: 0.5ex;
  }
  .auth-overlay .tagline span {
    color: #326bbf;
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
    width: 160px;
    height: 100px;
    line-height: 80px;
    display: block;
    margin-left: auto;
    margin-right: auto;
    background-color: #141f33;
    border: var(--widget-border);
    border-radius: var(--widget-border-radius-small);
    font-size: 30px;
    color: #aeb7b7;
    letter-spacing: 0.5ex;
  }
  .dfinity img {
    width: 8em;
  }
</style>
