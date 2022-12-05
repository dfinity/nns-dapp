<script lang="ts">
  import { mockCanister } from "../../../mocks/canisters.mock";
  import CanisterDetailModals from "$lib/modals/canisters/CanisterDetailModals.svelte";
  import DetachActionButton from "$lib/components/canister-detail/DetachCanisterButton.svelte";
</script>

<DetachActionButton canisterId={mockCanister.canister_id} />

<CanisterDetailModals />
