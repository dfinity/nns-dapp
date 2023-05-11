<script lang="ts">
  import AdditionalInfoForm from "$lib/components/sale/AdditionalInfoForm.svelte";
  import { ICPToken, TokenAmount } from "@dfinity/nns";
  import type { Writable } from "svelte/store";

  export let conditionsToAccept: string | undefined;
  export let areConditionsAcceptedStore: Writable<boolean>;
  let areConditionsAccepted = false;

  $: areConditionsAcceptedStore &&
    areConditionsAcceptedStore.set(areConditionsAccepted);

  const minCommitment = TokenAmount.fromString({
    amount: "1.00",
    token: ICPToken,
  });
  const maxCommitment = TokenAmount.fromString({
    amount: "1000.00",
    token: ICPToken,
  });
  const userHasParticipated = false;
</script>

<AdditionalInfoForm
  {minCommitment}
  {maxCommitment}
  {userHasParticipated}
  bind:areConditionsAccepted
  {conditionsToAccept}
/>
