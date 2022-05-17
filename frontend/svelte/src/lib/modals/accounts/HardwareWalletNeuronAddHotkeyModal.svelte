<script lang="ts">
  import ConfirmationModal from "../ConfirmationModal.svelte";
  import type { NeuronId } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import { authStore } from "../../stores/auth.store";

  export let neuronId: NeuronId;
</script>

<ConfirmationModal on:nnsClose on:nnsConfirm>
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
