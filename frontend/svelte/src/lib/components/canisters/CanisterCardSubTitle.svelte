<script lang="ts">
  import type { CanisterDetails } from "../../canisters/nns-dapp/nns-dapp.types";
  import Identifier from "../ui/Identifier.svelte";
  import {mapCanisterDetails} from '../../utils/canisters.utils';

  export let canister: CanisterDetails;

  let canisterId: string;
  let validName: boolean;
  $: ({canisterId, validName} = mapCanisterDetails(canister));
</script>

{#if validName}
  <Identifier identifier={canisterId} showCopy />
{/if}
