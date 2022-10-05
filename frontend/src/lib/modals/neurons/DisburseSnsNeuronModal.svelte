<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { Step, Steps } from "$lib/stores/steps.state";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import { routeStore } from "$lib/stores/route.store";
  import { createEventDispatcher } from "svelte";
  import { disburse } from "$lib/services/sns-neurons.services";
  import { snsOnlyProjectStore } from "$lib/derived/selected-project.derived";
  import type { SnsNeuron } from "@dfinity/sns";
  import { assertNonNullish, fromDefinedNullable } from "@dfinity/utils";
  import { accountsStore } from "$lib/stores/accounts.store";
  import {
    getSnsNeuronIdAsHexString,
    getSnsNeuronStake,
  } from "$lib/utils/sns-neuron.utils";
  import type { Principal } from "@dfinity/principal";
  import { type Token, TokenAmount } from "@dfinity/nns";
  import ConfirmDisburseNeuron from "$lib/components/neuron-detail/ConfirmDisburseNeuron.svelte";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
  import LegacyWizardModal from "$lib/modals/LegacyWizardModal.svelte";
  import { neuronsPathStore } from "$lib/derived/paths.derived";
  import { syncAccounts } from "$lib/services/accounts.services";

  export let neuron: SnsNeuron;
  export let reloadContext: () => Promise<void>;

  let source: string;
  $: source = getSnsNeuronIdAsHexString(neuron);

  let amount: TokenAmount;
  $: amount = TokenAmount.fromE8s({
    amount: getSnsNeuronStake(neuron),
    token: $snsTokenSymbolSelectedStore as Token,
  });

  let fee: TokenAmount;
  $: fee = TokenAmount.fromE8s({
    // TODO(GIX-1044): update FeesStore with the current sns project value
    amount: $transactionsFeesStore.main,
    token: $snsTokenSymbolSelectedStore as Token,
  });

  const dispatcher = createEventDispatcher();
  // WizardModal was used to add extra steps afterwards to easily support disbursing to other accounts and/or provide custom amount?
  const steps: Steps = [
    {
      name: "ConfirmDisburse",
      showBackButton: false,
      title: $i18n.accounts.review_transaction,
    },
  ];

  let currentStep: Step;
  let loading: boolean = false;

  let destinationAddress: string | undefined;
  $: destinationAddress = $snsProjectMainAccountStore?.identifier;

  // load project accounts if not available
  const unsubscribe: Unsubscriber = snsOnlyProjectStore.subscribe(
    async (selectedProjectCanisterId) => {
      if (
        selectedProjectCanisterId === undefined ||
        $snsProjectMainAccountStore !== undefined
      ) {
        return;
      }

      loading = true;
      await loadSnsAccounts(selectedProjectCanisterId);
      loading = false;
    }
  );

  onDestroy(unsubscribe);

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

    await Promise.all([syncAccounts(), reloadContext()]);

    loading = false;

    stopBusy("disburse-sns-neuron");

    if (success) {
      toastsSuccess({
        labelKey: "neuron_detail.disburse_success",
      });

      routeStore.replace({
        path: $neuronsPathStore,
      });
    }

    dispatcher("nnsClose");
  };
</script>

<LegacyWizardModal {steps} bind:currentStep on:nnsClose>
  <svelte:fragment slot="title"
    ><span data-tid="disburse-sns-neuron-modal">{currentStep?.title}</span
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
      {fee}
    />
  {/if}
</LegacyWizardModal>
