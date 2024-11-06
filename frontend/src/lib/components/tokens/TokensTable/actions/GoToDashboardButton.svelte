<script lang="ts">
  import LinkToDashboardCanister from "$lib/components/tokens/LinkToDashboardCanister.svelte";
  import type { UserTokenData, UserTokenFailed } from "$lib/types/tokens-page";
  import type { Principal } from "@dfinity/principal";

  export let userToken: UserTokenData | UserTokenFailed;

  let canisterId: Principal;
  $: canisterId = userToken.universeId;
</script>

<LinkToDashboardCanister {canisterId} />
