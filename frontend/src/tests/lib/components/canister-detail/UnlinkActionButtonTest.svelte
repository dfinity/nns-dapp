<script lang="ts">
  import { mockCanister } from "$tests/mocks/canisters.mock";
  import CanisterDetailModals from "$lib/modals/canisters/CanisterDetailModals.svelte";
  import UnlinkCanisterButton from "$lib/components/canister-detail/UnlinkCanisterButton.svelte";
</script>

<UnlinkCanisterButton canisterId={mockCanister.canister_id} />

<CanisterDetailModals />
