<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import WizardModal from "../WizardModal.svelte";
  import type { Step, Steps } from "../../stores/steps.state";
  import ConfirmDisburseNeuron from "../../components/neuron-detail/ConfirmDisburseNeuron.svelte";

  import { startBusy, stopBusy } from "../../stores/busy.store";
  import { toastsSuccess } from "../../stores/toasts.store";
  import { routeStore } from "../../stores/route.store";
  import { createEventDispatcher } from "svelte";
  import { AppPath } from "../../constants/routes.constants";
  import { disburse } from "../../services/sns-neurons.services";
  import { snsOnlyProjectStore } from "../../derived/selected-project.derived";
  import type { SnsNeuron } from "@dfinity/sns";
  import { assertNonNullish, fromDefinedNullable } from "@dfinity/utils";
  import { accountsStore } from "../../stores/accounts.store";
  import { getSnsNeuronIdAsHexString } from "../../utils/sns-neuron.utils";
  import type { E8s } from "@dfinity/nns/dist/types";
  import type { Principal } from "@dfinity/principal";

  export let neuron: SnsNeuron;

  let destinationAddress: string;
  $: destinationAddress = $accountsStore?.main?.identifier;

  let source: string;
  $: source = getSnsNeuronIdAsHexString(neuron);

  let amount: E8s;
  $: amount = neuron.cached_neuron_stake_e8s;

  const dispatcher = createEventDispatcher();
  const steps: Steps = [
    {
      name: "ConfirmDisburse",
      showBackButton: false,
      title: $i18n.accounts.review_transaction,
    },
  ];

  let currentStep: Step;
  let loading: boolean = false;

  const executeTransaction = async () => {
    startBusy({
      initiator: "disburse-sns-neuron",
    });

    loading = true;

    let rootCanisterId: Principal | undefined = $snsOnlyProjectStore;

    assertNonNullish(rootCanisterId);

    const { success } = await disburse({
      rootCanisterId,
      neuronId: fromDefinedNullable(neuron.id),
    });

    loading = false;

    stopBusy("disburse-sns-neuron");

    if (success) {
      toastsSuccess({
        labelKey: "neuron_detail.disburse_success",
      });

      routeStore.replace({
        path: AppPath.LegacyNeurons,
      });
    }

    dispatcher("nnsClose");
  };
</script>

<WizardModal {steps} bind:currentStep on:nnsClose>
  <svelte:fragment slot="title"
    ><span data-tid="disburse-neuron-modal">{currentStep?.title}</span
    ></svelte:fragment
  >
  {#if currentStep.name === "ConfirmDisburse" && destinationAddress !== undefined}
    <ConfirmDisburseNeuron
      on:nnsClose
      on:nnsConfirm={executeTransaction}
      {amount}
      {source}
      {loading}
      {destinationAddress}
    />
  {/if}
</WizardModal>
