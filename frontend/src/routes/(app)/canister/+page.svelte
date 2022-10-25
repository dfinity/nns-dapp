<script lang="ts">
  import CanisterDetail from "$lib/pages/CanisterDetail.svelte";
  import SignInNNS from "$lib/pages/SignInNNS.svelte";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  // Preloaded by +page.ts
  export let data: { canister: string | null | undefined };

  let canisterId: string | null | undefined;
  $: ({ canister: canisterId } = data);
</script>

{#if signedIn}
  <CanisterDetail {canisterId} />
{:else}
  <SignInNNS />
{/if}
