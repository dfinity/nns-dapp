<script lang="ts">
  import ActiveDisbursementItem from "$lib/components/neuron-detail/ActiveDisbursementEntry.svelte";
  import { secondsToDateTime } from "$lib/utils/date.utils";
  import { formatMaturity } from "$lib/utils/neuron.utils";
  import { encodeIcrcAccount, type IcrcAccount } from "@dfinity/ledger-icrc";
  import type {
    Account,
    DisburseMaturityInProgress,
  } from "@dfinity/sns/dist/candid/sns_governance";
  import { fromDefinedNullable, fromNullable } from "@dfinity/utils";

  export let disbursement: DisburseMaturityInProgress;

  let dateTime: string;
  $: dateTime = secondsToDateTime(
    disbursement.timestamp_of_disbursement_seconds
  );

  let account: Account;
  $: account = fromDefinedNullable(disbursement.account_to_disburse_to);

  let destination: string;
  $: destination = encodeIcrcAccount({
    owner: fromDefinedNullable(account.owner),
    subaccount: fromNullable(account.subaccount),
  } as IcrcAccount);

  let amount: string;
  $: amount = formatMaturity(disbursement.amount_e8s);
</script>

<ActiveDisbursementItem {dateTime} {destination} {amount} />
