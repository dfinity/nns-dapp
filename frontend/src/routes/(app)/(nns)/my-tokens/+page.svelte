<script lang="ts">
  import { goto } from "$app/navigation";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import MyTokens from "$lib/pages/MyTokens.svelte";
  import SignInMyTokens from "$lib/pages/SignInMyTokens.svelte";
  import { ENABLE_MY_TOKENS } from "$lib/stores/feature-flags.store";
  import { onMount } from "svelte";

  onMount(() => {
    if (!$ENABLE_MY_TOKENS) {
      goto(AppPath.Accounts);
    }
  });
</script>

<TestIdWrapper testId="my-tokens-route-component">
  {#if $authSignedInStore}
    <MyTokens />
  {:else}
    <SignInMyTokens />
  {/if}
</TestIdWrapper>
