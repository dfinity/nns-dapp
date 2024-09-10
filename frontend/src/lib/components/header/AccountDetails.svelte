<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import Hash from "$lib/components/ui/Hash.svelte";
  import { IconInfo, Tooltip } from "@dfinity/gix-components";
  import { authStore } from "$lib/stores/auth.store";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import TooltipIcon from "../ui/TooltipIcon.svelte";
  import IdentifierHash from "../ui/IdentifierHash.svelte";

  let principalId: string;
  let accountId: string;

  $: principalId = $authStore.identity?.getPrincipal().toText() ?? "";
  $: accountId = $icpAccountsStore.main?.identifier ?? "";
</script>

<div class="account-details">
  <div class="detail-row">
    <span class="label" data-tid="main-icp-account-id-label"
      >{$i18n.header.main_icp_account_id}</span
    >
    <div class="id-wrapper" data-tid="main-icp-account-id-wrapper">
      <IdentifierHash identifier={accountId} />

      <TooltipIcon
        text={$i18n.header.account_id_tooltip}
        tooltipId="main-icp-account-id-tooltip"
      />
    </div>
  </div>

  <div class="detail-row">
    <span class="label" data-tid="principal-id-label"
      >{$i18n.header.principal_id}</span
    >
    <div class="id-wrapper" data-tid="principal-id-wrapper">
      <IdentifierHash identifier={principalId} />
    </div>
  </div>
</div>

<style lang="scss">
  .account-details {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  .detail-row {
    display: flex;
    flex-direction: column;
  }

  .label {
    font-size: var(--font-size-small);
    color: var(--text-secondary);
  }

  .id-wrapper {
    display: flex;
    align-items: center;
  }
</style>
