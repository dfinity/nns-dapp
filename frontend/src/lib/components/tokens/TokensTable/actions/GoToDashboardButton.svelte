<script lang="ts">
  import type { UserTokenFailed } from "$lib/types/tokens-page";
  import type { Principal } from "@dfinity/principal";
  import LinkToDashboardCanister from "$lib/components/tokens/LinkToDashboardCanister.svelte";

  export let userToken: UserTokenFailed;

  let canisterId: Principal;
  $: canisterId = userToken.universeId;
</script>

<LinkToDashboardCanister {canisterId} />
