<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import Launchpad from "$lib/pages/Launchpad.svelte";
  import { onMount } from "svelte";
  import { layoutBackStore, layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  onMount(() => {
    layoutTitleStore.set($i18n.sns_launchpad.header);

    // Reset back action because only detail routes have such feature other views use the menu
    layoutBackStore.set(undefined);
  });
</script>

{#if signedIn}
  <Launchpad />
{:else}
  <h1>Canisters NOT signed in</h1>

  <SignIn />
{/if}
