<script lang="ts">
  import ConfirmationModal from "$lib/modals/common/ConfirmationModal.svelte";
  import { addHotkeyForHardwareWalletNeuron } from "$lib/services/neurons.services";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError } from "$lib/stores/toasts.store";
  import type { Account } from "$lib/types/account";
  import {
    WALLET_CONTEXT_KEY,
    type HardwareWalletNeuronInfo,
    type WalletContext,
  } from "$lib/types/wallet.context";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import type { NeuronId } from "@dfinity/nns";
  import { createEventDispatcher, getContext } from "svelte";

  export let neuronId: NeuronId;

  // Get the selected account from the account context - "Wallet" detail page context
  const { store } = getContext<WalletContext>(WALLET_CONTEXT_KEY);
  let selectedAccount: Account | undefined;
  $: selectedAccount = $store.account;

  const dispatch = createEventDispatcher();

  // We do not fetch again all the neurons on the ledger and solely update the UI to replicate the UI/UX that was developed in Flutter and is already in production.
  // i.e. the neuron that has just been added to the hotkey control will be displayed as "Added to NNS Dapp"
  const updateContextStoreNeuron = () =>
    store.update(({ neurons, ...rest }) => ({
      ...rest,
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
      toastsError({
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
  <div>
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
  </div>
</ConfirmationModal>

<style lang="scss">
  @use "../../themes/mixins/confirmation-modal";

  div {
    @include confirmation-modal.wrapper;
  }

  h4 {
    @include confirmation-modal.title;
  }

  p {
    @include confirmation-modal.text;
    &:last-of-type {
      padding-bottom: var(--padding-2x);
    }
  }
</style>
