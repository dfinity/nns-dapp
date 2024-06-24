<script lang="ts">
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import Canisters from "$lib/pages/Canisters.svelte";
  import SignInCanisters from "$lib/pages/SignInCanisters.svelte";
</script>

{#if $authSignedInStore}
  <Canisters />
{:else}
  <SignInCanisters />
{/if}
