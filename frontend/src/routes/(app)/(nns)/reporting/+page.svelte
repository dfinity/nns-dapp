<script lang="ts">
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import SignInReporting from "$lib/pages/SignInReporting.svelte";
  import Reporting from "$lib/routes/Reporting.svelte";
</script>

{#if $authSignedInStore}
  <Reporting />
{:else}
  <SignInReporting />
{/if}
