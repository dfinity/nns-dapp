<script lang="ts">
  import type { DisburseMaturityInProgress } from "@dfinity/sns/dist/candid/sns_governance";
  import { secondsToDuration } from "$lib/utils/date.utils";
  import { fromDefinedNullable, fromNullable } from "@dfinity/utils";
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import type { Account } from "@dfinity/sns/dist/candid/sns_governance";
  import ActiveDisbursementItem from "$lib/components/neuron-detail/ActiveDisbursementEntry.svelte";
  import { getSnsActiveDisbursementTime } from "$lib/utils/sns-neuron.utils";
  import { formatMaturity } from "$lib/utils/neuron.utils";
  import { encodeIcrcAccount, type IcrcAccount } from "@dfinity/ledger";

  export let disbursement: DisburseMaturityInProgress;

  let formattedTime: string;
  $: formattedTime = secondsToDuration(
    getSnsActiveDisbursementTime(disbursement)
  );

  let account: Account;
  $: account = fromDefinedNullable(disbursement.account_to_disburse_to);

  let formattedAccount: string;
  $: formattedAccount = shortenWithMiddleEllipsis(
    encodeIcrcAccount({
      owner: fromDefinedNullable(account.owner),
      subaccount: fromNullable(account.subaccount),
    } as IcrcAccount)
  );

  let formattedAmount: string;
  $: formattedAmount = formatMaturity(disbursement.amount_e8s);
</script>

<ActiveDisbursementItem {formattedTime} {formattedAccount} {formattedAmount} />
