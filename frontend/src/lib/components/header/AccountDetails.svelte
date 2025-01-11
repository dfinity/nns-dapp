<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import IdentifierHash from "$lib/components/ui/IdentifierHash.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import { nonNullish } from "@dfinity/utils";

  let principalId: string | undefined;
  let accountId: string | undefined;

  $: principalId = $authStore.identity?.getPrincipal().toText();
  $: accountId = $icpAccountsStore.main?.identifier;
</script>

<TestIdWrapper testId="account-details-component">
  {#if nonNullish(accountId) || nonNullish(principalId)}
    <div class="account-details">
      {#if nonNullish(accountId)}
        <div class="detail-row">
          <span class="description text-small"
            >{$i18n.header.main_icp_account_id}</span
          >
          <div class="id-container" data-tid="main-icp-account-id-container">
            <IdentifierHash identifier={accountId} />
            <TooltipIcon
              text={$i18n.header.account_id_tooltip}
              tooltipId="main-icp-account-id-tooltip"
            />
          </div>
        </div>
      {/if}
      {#if nonNullish(principalId)}
        <div class="detail-row">
          <span class="description text-small">{$i18n.core.principal_id}</span>
          <div class="id-container" data-tid="principal-id-container">
            <IdentifierHash identifier={principalId} />
          </div>
        </div>
      {/if}
    </div>
  {/if}
</TestIdWrapper>

<style lang="scss">
  .text-small {
    font-size: var(--font-size-small);
  }
  .account-details {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }
  .detail-row {
    display: flex;
    flex-direction: column;
  }
  .id-container {
    display: flex;
    align-items: center;
  }
</style>
