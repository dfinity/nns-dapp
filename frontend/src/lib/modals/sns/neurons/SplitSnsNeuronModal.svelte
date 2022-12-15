<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Modal, Value, busy } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";
  import type { SnsNeuron } from "@dfinity/sns";
  import { getSnsNeuronStake } from "$lib/utils/sns-neuron.utils";
  import type { E8s, Token } from "@dfinity/nns";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import type { Principal } from "@dfinity/principal";
  import { loadSnsParameters } from "$lib/services/sns-parameters.services";
  import { isValidInputAmount } from "$lib/utils/neuron.utils";
  import { TokenAmount } from "@dfinity/nns";
  import { snsParametersStore } from "$lib/stores/sns-parameters.store";
  import type { NervousSystemParameters } from "@dfinity/sns/dist/candid/sns_governance";
  import { fromDefinedNullable } from "@dfinity/utils";
  import CurrentBalance from "$lib/components/accounts/CurrentBalance.svelte";
  import AmountInput from "$lib/components/ui/AmountInput.svelte";
  import { formattedTransactionFee } from "$lib/utils/token.utils.js";
  import {snsSelectedTransactionFeeStore} from "$lib/derived/sns/sns-selected-transaction-fee.store";
  import {toastsError} from "$lib/stores/toasts.store";

  export let rootCanisterId: Principal;
  export let neuron: SnsNeuron;
  export let token: Token;
  export let reloadNeuron: () => Promise<void>;

  $: console.log('token', token)

  let parameters: NervousSystemParameters | undefined;
  $: parameters = $snsParametersStore?.[rootCanisterId?.toText()]?.parameters;

  $: console.log('parameters', parameters)

  // $: if (parameters === undefined) {
  //   console.log("🧪 should preload params");
  //   loadSnsParameters(rootCanisterId);
  // }
  //
  let amount: number | undefined;

  let fee: TokenAmount;
  $: fee = $snsSelectedTransactionFeeStore;

  let stakeE8s: E8s;
  $: stakeE8s = getSnsNeuronStake(neuron);

  let balance: TokenAmount;
  $: balance = TokenAmount.fromE8s({ amount: stakeE8s, token });

  let max = 0;
  $: max =
    stakeE8s === 0n || parameters === undefined || fee === undefined
      ? 0
      : Number(stakeE8s - fee.toE8s()) /
        Number(fromDefinedNullable(parameters.neuron_minimum_stake_e8s));

  let validForm: boolean;
  $: validForm = isValidInputAmount({ amount, max });

  const onMax = () => (amount = max);

  const dispatcher = createEventDispatcher();
  const close = () => dispatcher("nnsClose");

  const split = async () => {
    // TS is not smart enought to understand that `validForm` also covers `amount === undefined`
    if (!validForm || amount === undefined) {
      toastsError({
        labelKey: "error.amount_not_valid",
      });
      return;
    }
    startBusy({ initiator: "split-neuron" });

    /*
    const id = await splitNeuron({
      neuronId: neuron.neuronId,
      amount,
    });

    if (id !== undefined) {
      toastsSuccess({
        labelKey: "neuron_detail.split_neuron_success",
      });
    }
     */
    close();
    stopBusy("split-neuron");
  };

  /*
  const updateDissolveDelay = async () => {
    try {
      startBusy({
        initiator: "dissolve-sns-action",
      });

      const { success } = await updateDelay({
        rootCanisterId,
        neuron,
        dissolveDelaySeconds: delayInSeconds,
      });

      await reloadNeuron();

      stopBusy("dissolve-sns-action");

      if (success) {
        dispatcher("nnsUpdated");
      }
    } catch (err) {
      toastsError({
        labelKey: "error__sns.sns_dissolve_delay_action",
        err,
      });
    }

    closeModal();
  };
  */

</script>

<Modal on:nnsClose>
  <svelte:fragment slot="title"
    >{$i18n.neuron_detail.split_neuron}</svelte:fragment
  >
  <div class="wrapper" data-tid="split-neuron-modal">
    <CurrentBalance {balance} />

    <AmountInput bind:amount on:nnsMax={onMax} {max} />

    <div>
      <p class="label">{$i18n.neurons.transaction_fee}</p>
      <p>
        <Value
          >
                {formattedTransactionFee(TokenAmount.fromE8s({ amount: fee?.toE8s() ?? 0n, token }))}
                </Value
        > ICP
      </p>
    </div>

    <div class="toolbar">
      <button class="secondary" on:click={close}>
        {$i18n.core.cancel}
      </button>
      <button
        data-tid="split-neuron-button"
        class="primary"
        on:click={split}
        disabled={!validForm || $busy}
      >
        {$i18n.neuron_detail.split_neuron_confirm}
      </button>
    </div>
  </div>
</Modal>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }
</style>
