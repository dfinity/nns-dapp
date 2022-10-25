<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import Accounts from "$lib/routes/Accounts.svelte";
  import { onMount } from "svelte";
  import { layoutBackStore, layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  onMount(() => {
    layoutTitleStore.set($i18n.navigation.tokens);

    // Reset back action because only detail routes have such feature other views use the menu
    layoutBackStore.set(undefined);
  });
</script>

{#if signedIn}
  <Accounts />
{:else}
  <h1>Accounts NOT signed in</h1>

  <SignIn />
{/if}
