<script lang="ts">
  import ConfirmationModal from "../ConfirmationModal.svelte";
  import type { NeuronId } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import { authStore } from "../../stores/auth.store";
  import {addHotkeyForHardwareWalletNeuron} from '../../services/neurons.services';
  import type {Account} from '../../types/account';
  import {createEventDispatcher} from 'svelte';

  export let selectedAccount: Account;
  export let neuronId: NeuronId;

  const dispatch = createEventDispatcher();

  const addCurrentUserToHotkey = async () => {
    const {success} = await addHotkeyForHardwareWalletNeuron({
      neuronId,
      accountIdentifier: selectedAccount.identifier,
    });

    if (success) {
      dispatch('nnsHotkeyAdded');
      return;
    }

    dispatch('nnsClose');
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
  h4, p {
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
