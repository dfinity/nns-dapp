<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { authStore } from "$lib/stores/auth.store";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import TooltipIcon from "../ui/TooltipIcon.svelte";
  import IdentifierHash from "../ui/IdentifierHash.svelte";
  import { nonNullish } from "@dfinity/utils";
  import TestIdWrapper from "../common/TestIdWrapper.svelte";

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
