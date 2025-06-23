<script lang="ts">
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import CanisterDetail from "$lib/pages/CanisterDetail.svelte";
  import SignInCanisters from "$lib/pages/SignInCanisters.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { layoutTitleStore } from "$lib/stores/layout.store";

  // Preloaded by +page.ts
  export let data: { canister: string | null | undefined };

  let canisterId: string | null | undefined;
  $: ({ canister: canisterId } = data);

  layoutTitleStore.set({
    title: $i18n.canister_detail.title,
  });
</script>

{#if $authSignedInStore}
  <CanisterDetail {canisterId} />
{:else}
  <SignInCanisters />
{/if}
