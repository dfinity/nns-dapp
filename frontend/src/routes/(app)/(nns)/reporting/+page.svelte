<script lang="ts">
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import SignInReporting from "$lib/pages/SignInReport.svelte";
  import Reporting from "$lib/routes/Report.svelte";
</script>

{#if $authSignedInStore}
  <Reporting />
{:else}
  <SignInReporting />
{/if}
