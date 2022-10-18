<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import Accounts from "$lib/routes/Accounts.svelte";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import { Spinner } from "@dfinity/gix-components";
  import { browser } from "$app/environment";
  import { toastsError } from "$lib/stores/toasts.store";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  const syncAuthStore = async () => {
    try {
      if (!browser) {
        return;
      }

      await authStore.sync();
    } catch (err) {
      toastsError({ labelKey: "error.auth_sync", err });
    }
  };
</script>

{#if signedIn}
  <Accounts />
{:else}
  <h1>Accounts NOT signed in</h1>

  {#await syncAuthStore()}
    <Spinner />
  {:then _signIn}
    <SignIn />
  {/await}
{/if}
