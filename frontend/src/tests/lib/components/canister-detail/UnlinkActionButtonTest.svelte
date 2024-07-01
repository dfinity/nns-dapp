<script lang="ts">
  import UnlinkCanisterButton from "$lib/components/canister-detail/UnlinkCanisterButton.svelte";
  import CanisterDetailModals from "$lib/modals/canisters/CanisterDetailModals.svelte";
  import { mockCanister } from "$tests/mocks/canisters.mock";
</script>

<UnlinkCanisterButton canisterId={mockCanister.canister_id} />

<CanisterDetailModals />
