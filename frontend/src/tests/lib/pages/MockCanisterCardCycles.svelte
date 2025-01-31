<script lang="ts" context="module">
  let instanceCount = 0;
</script>

<script lang="ts">
  import type { CanisterDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";

  // The prop must exist to avoid
  //"<MockCanisterCardCycles> was created with unknown prop 'canister'"
  export let canister: CanisterDetails;

  instanceCount += 1;
</script>

<div data-tid="mock-canister-card-instance-count">
  { instanceCount }
</div>

{#if false}
  <div>
    We must reference canister to avoid
    "Component has unused export property 'canister'."
    {canister}
  </div>
{/if}
