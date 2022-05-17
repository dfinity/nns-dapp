<script lang="ts">
  import ConfirmationModal from "../ConfirmationModal.svelte";
  import type { NeuronId } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import { authStore } from "../../stores/auth.store";
  import { addHotkeyForHardwareWalletNeuron } from "../../services/neurons.services";
  import type { Account } from "../../types/account";
  import { createEventDispatcher, getContext } from "svelte";
  import {
    HARDWARE_WALLET_NEURONS_CONTEXT_KEY,
    type HardwareWalletNeuronsContext,
  } from "../../types/hardware-wallet-neurons.context";
  import type { NeuronInfo } from "@dfinity/nns";
  import { toastsStore } from "../../stores/toasts.store";

  export let neuronId: NeuronId;

  const context: HardwareWalletNeuronsContext =
    getContext<HardwareWalletNeuronsContext>(
      HARDWARE_WALLET_NEURONS_CONTEXT_KEY
    );
  const { store }: HardwareWalletNeuronsContext = context;

  let selectedAccount: Account | undefined = undefined;
  let neurons: NeuronInfo[] = [];

  $: ({ neurons, selectedAccount } = $store);

  const dispatch = createEventDispatcher();

  // We do not fetch again all the neurons on the ledger and solely update the UI to replicate the UI/UX that was developed in Flutter and is already in production.
  // i.e. the neuron that has just been added to the hotkey control will be displayed as "Added to NNS dapp"
  const updateStoreNeuron = () => {
    store.update(({ selectedAccount, neurons }) => ({
      selectedAccount,
      neurons: neurons.map((neuron) => {
        if (neuron.neuronId !== neuronId) {
          return neuron;
        }

        return {
          ...neuron,
          controlledByNNSDapp: true,
        };
      }),
    }));
  };

  const addCurrentUserToHotkey = async () => {
    if (selectedAccount === undefined) {
      toastsStore.error({
        labelKey: "error.hardware_wallet_no_account",
      });
      dispatch("nnsClose");
      return;
    }

    const { success } = await addHotkeyForHardwareWalletNeuron({
      neuronId,
      accountIdentifier: selectedAccount.identifier,
    });

    if (success) {
      updateStoreNeuron();
    }

    dispatch("nnsClose");
  };
</script>

<ConfirmationModal on:nnsClose on:nnsConfirm={addCurrentUserToHotkey}>
  <h4>{$i18n.accounts.hardware_wallet_add_hotkey_title}</h4>

  <p>
    {replacePlaceholders(
      $i18n.accounts.hardware_wallet_add_hotkey_text_neuron,
      {
        $neuronId: neuronId.toString(),
      }
    )}
  </p>

  <p>
    {replacePlaceholders(
      $i18n.accounts.hardware_wallet_add_hotkey_text_principal,
      {
        $principalId: $authStore.identity?.getPrincipal().toText() ?? "",
      }
    )}
  </p>

  <p>{$i18n.accounts.hardware_wallet_add_hotkey_text_confirm}</p>
</ConfirmationModal>

<style lang="scss">
  h4,
  p {
    text-align: center;
  }

  h4 {
    padding-bottom: var(--padding-0_5x);
  }

  p {
    padding-bottom: var(--padding);

    &:last-of-type {
      padding-bottom: var(--padding-2x);
    }
  }
</style>
