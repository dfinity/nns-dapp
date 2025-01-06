<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import SignInReporting from "$lib/pages/SignInReporting.svelte";
  import Reporting from "$lib/routes/Reporting.svelte";
</script>

<TestIdWrapper testId="reporting-route-component">
  {#if $authSignedInStore}
    <Reporting />
  {:else}
    <SignInReporting />
  {/if}
</TestIdWrapper>
