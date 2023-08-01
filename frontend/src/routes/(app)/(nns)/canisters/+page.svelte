<script lang="ts">
  import SignInCanisters from "$lib/pages/SignInCanisters.svelte";
  import type { AppPath } from "$lib/constants/routes.constants";
  import { afterNavigate } from "$app/navigation";
  import type { Navigation } from "@sveltejs/kit";
  import { referrerPathForNav } from "$lib/utils/page.utils";
  import Canisters from "$lib/pages/Canisters.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";

  let referrerPath: AppPath | undefined = undefined;
  afterNavigate((nav: Navigation) => (referrerPath = referrerPathForNav(nav)));
</script>

{#if $authSignedInStore}
  <Canisters {referrerPath} />
{:else}
  <SignInCanisters />
{/if}
