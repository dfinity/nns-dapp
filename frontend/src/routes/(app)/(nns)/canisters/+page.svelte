<script lang="ts">
  import SignInCanisters from "$lib/pages/SignInCanisters.svelte";
  import Canisters from "$lib/pages/Canisters.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
</script>

{#if $authSignedInStore}
  <Canisters />
{:else}
  <SignInCanisters />
{/if}
