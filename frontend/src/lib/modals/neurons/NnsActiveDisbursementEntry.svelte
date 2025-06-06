<script lang="ts">
  import ActiveDisbursementItem from "$lib/components/neuron-detail/ActiveDisbursementEntry.svelte";
  import { secondsToDateTime } from "$lib/utils/date.utils";
  import { formatMaturity } from "$lib/utils/neuron.utils";
  import { encodeIcrcAccount, type IcrcAccount } from "@dfinity/ledger-icrc";
  import type { MaturityDisbursement } from "@dfinity/nns";
  import { nonNullish } from "@dfinity/utils";

  type Props = {
    disbursement: MaturityDisbursement;
  };
  const { disbursement }: Props = $props();
  const dateTime = $derived(
    secondsToDateTime(disbursement.timestampOfDisbursementSeconds ?? 0n)
  );
  const account = $derived(disbursement.accountToDisburseTo);
  const destination = $derived(
    nonNullish(account)
      ? encodeIcrcAccount({
          owner: account.owner,
          subaccount: account.subaccount,
        } as IcrcAccount)
      : ""
  );
  const amount = formatMaturity(disbursement.amountE8s ?? 0n);
</script>

<ActiveDisbursementItem {dateTime} {destination} {amount} />
