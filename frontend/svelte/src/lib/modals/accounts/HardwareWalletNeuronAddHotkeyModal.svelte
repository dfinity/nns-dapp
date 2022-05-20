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
    type HardwareWalletNeuronInfo,
    type HardwareWalletNeuronsContext,
  } from "../../types/hardware-wallet-neurons.context";
  import { toastsStore } from "../../stores/toasts.store";
  import {
    SELECTED_ACCOUNT_CONTEXT_KEY,
    type SelectedAccountContext,
  } from "../../types/selected-account.context";

  export let neuronId: NeuronId;

  // Get the selected account from the account context - "Wallet" detail page context
  const { store: storeAccount } = getContext<SelectedAccountContext>(
    SELECTED_ACCOUNT_CONTEXT_KEY
  );
  let selectedAccount: Account | undefined;
  $: selectedAccount = $storeAccount.account;

  // Get the store for the neurons of the hardware wallet from the dedicated context
  const context: HardwareWalletNeuronsContext =
    getContext<HardwareWalletNeuronsContext>(
      HARDWARE_WALLET_NEURONS_CONTEXT_KEY
    );
  const { store }: HardwareWalletNeuronsContext = context;

  const dispatch = createEventDispatcher();

  // We do not fetch again all the neurons on the ledger and solely update the UI to replicate the UI/UX that was developed in Flutter and is already in production.
  // i.e. the neuron that has just been added to the hotkey control will be displayed as "Added to NNS dapp"
  const updateContextStoreNeuron = () =>
    store.update(({ neurons }) => ({
      neurons: neurons.map((neuron: HardwareWalletNeuronInfo) =>
        neuron.neuronId !== neuronId
          ? neuron
          : {
              ...neuron,
              controlledByNNSDapp: true,
            }
      ),
    }));

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
      updateContextStoreNeuron();
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
