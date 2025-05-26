<script lang="ts">
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import DisburseMaturityModal from "$lib/modals/neurons/DisburseMaturityModal.svelte";
  import { disburseMaturity } from "$lib/services/neurons.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
  import type { NeuronId, NeuronInfo } from "@dfinity/nns";
  import { ICPToken, isNullish } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";
  import { get } from "svelte/store";
  import { icpAccountsStore } from "../../derived/icp-accounts.derived";
  import { isIcpAccountIdentifier } from "@dfinity/ledger-icp";

  type Props = {
    neuron: NeuronInfo;
    neuronId: NeuronId;
    close: () => void;
  };

  export const { neuron, neuronId, close }: Props = $props();

  // TODO(disburse-maturity): use the real fee (networkEconomics?)
  const minimumAmountE8s = $derived(0n); // minimumAmountToDisburseMaturity(ICPToken?.fee ?? 0n);

  const dispatcher = createEventDispatcher();

  // TODO(disburse-maturity): add validation (isIcpAccountIdentifier)
  const disburseMaturity2 = async ({
    detail: { percentageToDisburse, destinationAddress },
  }: CustomEvent<{
    percentageToDisburse: number;
    destinationAddress: string;
  }>) => {
    const accounts = get(icpAccountsStore);
    const isMainAccount = destinationAddress === accounts.main?.identifier;
    const isSubAccount = accounts?.subAccounts?.find(
      ({ identifier }) => identifier === destinationAddress
    );

    // Main account is the default account — not needed to be provided (undefined)
    const account = isMainAccount ? undefined : accounts.main?.principal;
    // Only user sub-accounts are supported.
    const subAccount = isSubAccount ? destinationAddress : undefined;

    // TODO(disburse-maturity): switch to account identifier when API supports it
    // if () {
    //   toastsError({
    //     labelKey: "Transfer between accounts is not supported yet",
    //   });
    // }

    // log account and subAccount
    console.log("Disburse maturity account", account);
    console.log("Disburse maturity subAccount", subAccount);

    startBusy({ initiator: "disburse-maturity" });

    // TODO(disburse-maturity): switch to account identifier when API supports it
    await disburseMaturity({
      neuronId,
      percentageToDisburse,
      account,
      subAccount,
    });

    console.log("Disburse maturity success", neuron.fullNeuron);

    toastsSuccess({
      labelKey: "neuron_detail.disburse_maturity_success",
    });

    close();

    stopBusy("disburse-maturity");
  };

  const availableMaturityE8s = $derived(
    neuron.fullNeuron?.maturityE8sEquivalent ?? 0n
  );
</script>

<DisburseMaturityModal
  {availableMaturityE8s}
  {minimumAmountE8s}
  on:nnsDisburseMaturity={disburseMaturity2}
  rootCanisterId={OWN_CANISTER_ID}
  token={ICPToken}
  on:nnsClose={close}
/>
