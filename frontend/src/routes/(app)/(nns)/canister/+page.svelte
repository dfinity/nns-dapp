<script lang="ts">
  import SignInCanisters from "$lib/pages/SignInCanisters.svelte";
  import CanisterDetail from "$lib/pages/CanisterDetail.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";

  // Preloaded by +page.ts
  export let data: { canister: string | null | undefined };

  let canisterId: string | null | undefined;
  $: ({ canister: canisterId } = data);
</script>

{#if $authSignedInStore}
  <CanisterDetail {canisterId} />
{:else}
  <SignInCanisters />
{/if}
