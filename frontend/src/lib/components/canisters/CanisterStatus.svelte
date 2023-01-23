<script lang="ts">
  import { CanisterStatus } from "$lib/canisters/ic-management/ic-management.canister.types";
  import { i18n } from "$lib/stores/i18n";

  export let status: CanisterStatus;
</script>

{#if status === CanisterStatus.Stopped}
  {$i18n.canister_detail.status_stopped}
{:else if status === CanisterStatus.Stopping}
  {$i18n.canister_detail.status_stopping}
{:else}
  {$i18n.canister_detail.status_running}
{/if}
