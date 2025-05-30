<script lang="ts">
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import DisburseMaturityModal from "$lib/modals/neurons/DisburseMaturityModal.svelte";
  import { disburseMaturity as disburseMaturityService } from "$lib/services/neurons.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import type { NeuronId, NeuronInfo } from "@dfinity/nns";
  import { ICPToken } from "@dfinity/utils";
  import { get } from "svelte/store";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { mainTransactionFeeE8sStore } from "../../derived/main-transaction-fee.derived";

  type Props = {
    neuron: NeuronInfo;
    neuronId: NeuronId;
    close: () => void;
  };

  const { neuron, neuronId, close }: Props = $props();

  const minimumAmountE8s = $derived($mainTransactionFeeE8sStore);

  // TODO(disburse-maturity): ¿add validation (isIcpAccountIdentifier)
  const disburseMaturity = async ({
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

    startBusy({ initiator: "disburse-maturity" });

    // TODO(disburse-maturity): switch to account identifier when API supports it
    await disburseMaturityService({
      neuronId,
      percentageToDisburse,
      // account,
      // subAccount,
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
  on:nnsDisburseMaturity={disburseMaturity}
  rootCanisterId={OWN_CANISTER_ID}
  token={ICPToken}
  on:nnsClose={close}
/>
