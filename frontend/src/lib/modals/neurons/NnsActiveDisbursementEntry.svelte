<script lang="ts">
  import ActiveDisbursementItem from "$lib/components/neuron-detail/ActiveDisbursementEntry.svelte";
  import { secondsToDateTime } from "$lib/utils/date.utils";
  import { formatMaturity } from "$lib/utils/neuron.utils";
  import type { MaturityDisbursement } from "@icp-sdk/canisters/nns";
  import { nonNullish } from "@dfinity/utils";

  type Props = {
    disbursement: MaturityDisbursement;
  };
  const { disbursement }: Props = $props();
  const dateTime = $derived(
    secondsToDateTime(disbursement.timestampOfDisbursementSeconds ?? 0n)
  );
  const destination = $derived(
    nonNullish(disbursement.accountIdentifierToDisburseTo)
      ? disbursement.accountIdentifierToDisburseTo
      : ""
  );
  const amount = formatMaturity(disbursement.amountE8s ?? 0n);
</script>

<ActiveDisbursementItem {dateTime} {destination} {amount} />
