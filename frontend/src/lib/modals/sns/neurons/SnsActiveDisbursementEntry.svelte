<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconClockNoFill } from "@dfinity/gix-components";
  import type { DisburseMaturityInProgress } from "@dfinity/sns/dist/candid/sns_governance";
  import { secondsToDuration } from "$lib/utils/date.utils";
  import { fromDefinedNullable } from "@dfinity/utils";
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import type { Account } from "@dfinity/sns/dist/candid/sns_governance";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";

  export let disbursement: DisburseMaturityInProgress;

  let formattedTime: string;
  $: formattedTime = secondsToDuration(
    disbursement.timestamp_of_disbursement_seconds
  );

  let account: Account;
  $: account = fromDefinedNullable(disbursement.account_to_disburse_to);

  let formattedAccount: string;
  $: formattedAccount = shortenWithMiddleEllipsis(account.owner.toString());

  let amount: bigint;
  $: amount = disbursement.amount_e8s;
</script>

<div class="content">
  <div class="description">
    <IconClockNoFill size="20" />
    <span>
      {replacePlaceholders(
        $i18n.neuron_detail.view_active_disbursements_entry_description,
        {
          $time: formattedTime,
          $account: formattedAccount,
        }
      )}
    </span>
  </div>
  <span class="value">
    {replacePlaceholders(
      $i18n.neuron_detail.view_active_disbursements_maturity,
      {
        $maturity: amount,
      }
    )}
  </span>
</div>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);
  }

  .description {
    display: flex;
    gap: var(--padding);
    align-items: center;
  }
</style>
