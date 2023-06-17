<script lang="ts">
  import type { CanisterDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import IdentifierHash from "$lib/components/ui/IdentifierHash.svelte";
  import { mapCanisterDetails } from "$lib/utils/canisters.utils";

  export let canister: CanisterDetails;

  let canisterId: string;
  let validName: boolean;
  $: ({ canisterId, validName } = mapCanisterDetails(canister));
</script>

{#if validName}
  <IdentifierHash identifier={canisterId} />
{/if}
