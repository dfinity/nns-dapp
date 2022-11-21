<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { AppPath } from "$lib/constants/routes.constants";
  import { IconClose, Value } from "@dfinity/gix-components";
  import { getAuthenticatedIdentity } from "$lib/services/auth.services";
  import { startBusyNeuron } from "$lib/services/busy.services";
  import { removeHotkey } from "$lib/services/neurons.services";
  import { accountsStore } from "$lib/stores/accounts.store";
  import { authStore } from "$lib/stores/auth.store";
  import { stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsShow } from "$lib/stores/toasts.store";
  import { isNeuronControllable } from "$lib/utils/neuron.utils";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import AddHotkeyButton from "./actions/AddHotkeyButton.svelte";
  import { goto } from "$app/navigation";

  export let neuron: NeuronInfo;

  let isControllable: boolean;
  $: isControllable = isNeuronControllable({
    neuron,
    identity: $authStore.identity,
    accounts: $accountsStore,
  });
  let hotkeys: string[];
  $: hotkeys = neuron.fullNeuron?.hotKeys ?? [];

  const remove = async (hotkey: string) => {
    startBusyNeuron({
      initiator: "remove-hotkey-neuron",
      neuronId: neuron.neuronId,
    });
    const maybeNeuronId = await removeHotkey({
      neuronId: neuron.neuronId,
      principalString: hotkey,
    });
    const currentIdentityPrincipal = (await getAuthenticatedIdentity())
      .getPrincipal()
      .toText();
    // If the user removes itself from the hotkeys, it has no more access to the detail page.
    if (currentIdentityPrincipal === hotkey && maybeNeuronId !== undefined) {
      toastsShow({
        level: "success",
        labelKey: "neurons.remove_hotkey_success",
      });

      await goto(AppPath.Neurons, { replaceState: true });
    }
    stopBusy("remove-hotkey-neuron");
  };
</script>

<CardInfo>
  <h3 slot="start">{$i18n.neuron_detail.hotkeys_title}</h3>
  {#if hotkeys.length === 0}
    <p>{$i18n.neuron_detail.no_notkeys}</p>
  {:else}
    <ul>
      {#each hotkeys as hotkey (hotkey)}
        <li>
          <Value>{hotkey}</Value>
          {#if isControllable}
            <button
              class="text"
              aria-label={$i18n.core.remove}
              on:click={() => remove(hotkey)}
              data-tid="remove-hotkey-button"><IconClose size="18px" /></button
            >
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
  {#if isControllable}
    <div class="actions">
      <AddHotkeyButton neuronId={neuron.neuronId} />
    </div>
  {/if}
</CardInfo>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/card";

  h3 {
    line-height: var(--line-height-standard);
  }

  .actions {
    display: flex;
    justify-content: flex-start;
  }

  p {
    margin-top: 0;
    margin-bottom: var(--padding-2x);
  }

  ul {
    @include card.list;
  }

  li {
    @include card.list-item;

    button {
      display: flex;
    }
  }
</style>
