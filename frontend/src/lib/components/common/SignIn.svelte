<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError } from "$lib/stores/toasts.store";
  import { Spinner } from "@dfinity/gix-components";
  import { browser, prerendering } from "$app/environment";
  import { onMount } from "svelte";
  import { displayAndCleanLogoutMsg } from "$lib/services/auth.services";
  import { layoutAuthReady } from "$lib/stores/layout.store";

  const syncAuthStore = async () => {
    try {
      await authStore.sync();
    } catch (err) {
      toastsError({ labelKey: "error.auth_sync", err });
    }
  };

  onMount(async () => {
    if (prerendering || !browser) {
      return;
    }

    // TODO(GIX-1071): handle multiple sign-in buttons in one page. Only only one should initialize the auth.
    await syncAuthStore();

    displayAndCleanLogoutMsg();

    layoutAuthReady.set(true);
  });

  // Asks the user to authenticate themselves with a TPM or similar.
  const signIn = async () => {
    const onError = (err: unknown) =>
      toastsError({
        labelKey: "error.sign_in",
        err,
      });

    await authStore.signIn(onError);
  };

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  let disabled = true;
  $: disabled = signedIn || !$layoutAuthReady;
</script>

<button on:click={signIn} data-tid="login-button" class="primary" {disabled}>
  {$i18n.auth.login}
  {#if disabled}
    <div class="spinner">
      <Spinner size="small" inline />
    </div>
  {/if}
</button>

<style lang="scss">
  button {
    display: flex;
    justify-content: center;
    align-items: center;
    align-self: center;

    .spinner {
      margin-left: var(--padding);
    }
  }
</style>
