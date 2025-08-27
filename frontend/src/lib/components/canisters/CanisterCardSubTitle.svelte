<script lang="ts">
  import type { CanisterDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import IdentifierHash from "$lib/components/ui/IdentifierHash.svelte";
  import { mapCanisterDetails } from "$lib/utils/canisters.utils";

  type Props = {
    canister: CanisterDetails;
  };
  const { canister }: Props = $props();

  const { canisterId, validName } = $derived(mapCanisterDetails(canister));
</script>

{#if validName}
  <IdentifierHash identifier={canisterId} />
{/if}
