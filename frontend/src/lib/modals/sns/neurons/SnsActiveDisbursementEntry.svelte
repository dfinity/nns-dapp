<script lang="ts">
  import type { DisburseMaturityInProgress } from "@dfinity/sns/dist/candid/sns_governance";
  import { secondsToDuration } from "$lib/utils/date.utils";
  import { fromDefinedNullable } from "@dfinity/utils";
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import type { Account } from "@dfinity/sns/dist/candid/sns_governance";
  import ActiveDisbursementItem from "$lib/components/neuron-detail/ActiveDisbursementEntry.svelte";

  export let disbursement: DisburseMaturityInProgress;

  let formattedTime: string;
  $: formattedTime = secondsToDuration(
    disbursement.timestamp_of_disbursement_seconds
  );

  let account: Account;
  $: account = fromDefinedNullable(disbursement.account_to_disburse_to);

  let formattedAccount: string;
  $: formattedAccount = shortenWithMiddleEllipsis(account.owner.toString());

  let formattedAmount: bigint;
  $: formattedAmount = disbursement.amount_e8s;
</script>

<ActiveDisbursementItem {formattedTime} {formattedAccount} {formattedAmount} />
