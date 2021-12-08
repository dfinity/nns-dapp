<script lang="ts">
  import { onMount } from "svelte";
  import { AuthClient } from "@dfinity/auth-client";

  // Login status
  export let signedIn = false;
  export let principal = "";

  // Signs in, out, round and all about.
  let auth_client;
  let compile_time_const: any = null; // Satisfy the linter.
  let identityProvider = compile_time_const.INTERNET_IDENTITY_URL;

  // Sets initial login status
  const initAuth = async () => {
    auth_client = await AuthClient.create();
    const isAuthenticated = await auth_client.isAuthenticated();

    if (isAuthenticated) {
      onSignedIn();
    }
  };

  // Asks the user to authenticate themselves with a TPM or similar.
  const signIn = async () => {
    await new Promise((resolve, reject) => {
      auth_client.login({
        identityProvider,
        onSuccess: () => {
          resolve(null);
        },
        onError: reject,
      });
    });
    onSignedIn();
  };

  // Gets a local copy of user data.
  const onSignedIn = async () => {
    const identity = auth_client.getIdentity();
    principal = identity.getPrincipal().toString();
    signedIn = true;
  };

  // Signs out, erasing all local user data.
  const signOut = async () => {
    await auth_client.logout();
    signedIn = false;
    // Ensure that all data is wiped
    // ... if we have unencrypted data in local storage, delete it here.
    // ... wipe data in ephemeral state, but in the next tick allow repaint to finish first.
    setTimeout(() => location.reload(), 100);
  };

  // Sets login status on first load.
  onMount(initAuth);
</script>

<div class="auth-expandable">
  {#if !signedIn && auth_client}
    <div class="auth-overlay">
      <div />
      <h1>The Internet Computer</h1>
      <h2>Network Nervous System</h2>
      <div />
      <button on:click={signIn} class="auth-button">Login</button>
      <span>Beta</span>
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
    background-color: var(--background-grey);
    display: grid;
    grid-template-rows: 75px 70px 40px auto 120px 140px;
  }
  .auth-overlay h1 {
    font-size: var(--font-size-xlarge);
  }
  .auth-overlay h2 {
    font-size: var(--font-size-large);
  }
  .auth-overlay span {
    font-weight: bold;
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
    background-color: #52545a;
    border: var(--widget-border);
    border-radius: var(--widget-border-radius-small);
    font-size: 30px;
    color: #aeb7b7;
  }
</style>
