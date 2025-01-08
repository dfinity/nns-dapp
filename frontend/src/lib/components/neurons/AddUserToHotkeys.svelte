<script lang="ts">
  import { addHotkeyForHardwareWalletNeuron } from "$lib/services/neurons.services";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import { busy, IconInfo } from "@dfinity/gix-components";
  import type { NeuronId } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { ENABLE_PERIODIC_FOLLOWING_CONFIRMATION } from "$lib/stores/feature-flags.store";
  import Banner from "$lib/components/ui/Banner.svelte";
  import BannerIcon from "$lib/components/ui/BannerIcon.svelte";

  export let account: Account;
  export let neuronId: NeuronId;

  const dispatcher = createEventDispatcher();
  const skip = () => {
    dispatcher("nnsSkip");
  };

  // Add the auth identity principal as hotkey
  const addCurrentUserToHotkey = async () => {
    // This screen is only for Ledger device.
    const { success } = await addHotkeyForHardwareWalletNeuron({
      neuronId,
      accountIdentifier: account.identifier,
    });

    if (success) {
      dispatcher("nnsHotkeyAdded");
    }
  };
</script>

<div class="wrapper" data-tid="add-principal-to-hotkeys-modal">
  {#if $ENABLE_PERIODIC_FOLLOWING_CONFIRMATION}
    <Banner htmlText={$i18n.losing_rewards.hw_create_neuron_warning}>
      <BannerIcon slot="icon">
        <IconInfo />
      </BannerIcon>
    </Banner>
  {/if}

  <p class="description">{$i18n.neurons.add_user_as_hotkey_message}</p>

  <div>
    <p class="label">{$i18n.neurons.your_principal}</p>
    <p class="value">{$authStore.identity?.getPrincipal().toText() ?? ""}</p>
  </div>

  <div class="toolbar">
    <button
      on:click={skip}
      data-tid="skip-add-principal-to-hotkey-modal"
      class="secondary">{$i18n.neurons.skip}</button
    >
    <button
      class="primary"
      on:click={addCurrentUserToHotkey}
      data-tid="confirm-add-principal-to-hotkey-modal"
      disabled={$authStore.identity?.getPrincipal() === undefined || $busy}
    >
      {$i18n.neuron_detail.add_hotkey}
    </button>
  </div>
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }
</style>
