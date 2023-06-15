<script lang="ts">
  import type { SnsNeuron, SnsNeuronId } from "@dfinity/sns";
  import { fromDefinedNullable } from "@dfinity/utils";
  import { getContext } from "svelte";
  import { ICON_SIZE_LARGE } from "$lib/constants/layout.constants";
  import {
    IconClose,
    IconInfo,
    IconWarning,
    Value,
  } from "@dfinity/gix-components";
  import { removeHotkey } from "$lib/services/sns-neurons.services";
  import { authStore } from "$lib/stores/auth.store";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import {
    getSnsNeuronHotkeys,
    canIdentityManageHotkeys,
  } from "$lib/utils/sns-neuron.utils";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import AddSnsHotkeyButton from "./actions/AddSnsHotkeyButton.svelte";
  import { toastsShow } from "$lib/stores/toasts.store";
  import { goto } from "$app/navigation";
  import { neuronsPathStore } from "$lib/derived/paths.derived";
  import ConfirmRemoveCurrentUserHotkey from "$lib/modals/neurons/ConfirmRemoveCurrentUserHotkey.svelte";
  import type { SnsNervousSystemParameters } from "@dfinity/sns";
  import TestIdWrapper from "../common/TestIdWrapper.svelte";

  export let parameters: SnsNervousSystemParameters;

  const { reload, store }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let neuron: SnsNeuron | undefined | null;
  $: neuron = $store.neuron;
  let neuronId: SnsNeuronId | undefined;
  $: neuronId =
    neuron?.id !== undefined ? fromDefinedNullable(neuron.id) : undefined;

  let canManageHotkeys = true;
  $: canManageHotkeys =
    neuron !== undefined && neuron !== null
      ? canIdentityManageHotkeys({
          neuron,
          identity: $authStore.identity,
          parameters,
        })
      : false;
  let hotkeys: string[];
  $: hotkeys =
    neuron !== undefined && neuron !== null ? getSnsNeuronHotkeys(neuron) : [];

  let showTooltip: boolean;
  $: showTooltip = hotkeys.length > 0 && canManageHotkeys;

  let currentIdentityString: string | undefined;
  $: currentIdentityString = $authStore.identity?.getPrincipal().toText();

  let showConfirmationHotkey: string | undefined;
  const closeConfirmation = () => {
    showConfirmationHotkey = undefined;
  };
  const maybeRemove = async (hotkey: string) => {
    // Require confirmation if the user is removing itself from the hotkeys.
    if (currentIdentityString === hotkey) {
      showConfirmationHotkey = hotkey;
    } else {
      await remove(hotkey);
    }
  };

  const remove = async (hotkey: string) => {
    // Edge case: Remove button is shwon only when neuron is defined
    if (neuronId === undefined) {
      return;
    }
    startBusy({
      initiator: "remove-sns-hotkey-neuron",
    });
    const { success } = await removeHotkey({
      neuronId,
      hotkey,
      rootCanisterId: $selectedUniverseIdStore,
    });
    // If the user removes itself from the hotkeys, it has no more access to the detail page.
    if (currentIdentityString === hotkey && success) {
      toastsShow({
        level: "success",
        labelKey: "neurons.remove_hotkey_success",
      });

      await goto($neuronsPathStore);
      return;
    }
    if (success) {
      await reload();
    }
    stopBusy("remove-sns-hotkey-neuron");
  };
</script>

<TestIdWrapper testId="sns-neuron-hotkeys-card-component">
  {#if neuron !== undefined && neuron !== null}
    <CardInfo testId="sns-hotkeys-card">
      <div class="title" slot="start">
        <h3>{$i18n.neuron_detail.hotkeys_title}</h3>
        {#if showTooltip}
          <Tooltip
            id="sns-hotkeys-info"
            text={$i18n.sns_neuron_detail.add_hotkey_tooltip}
          >
            <span>
              <IconInfo />
            </span>
          </Tooltip>
        {/if}
      </div>
      {#if hotkeys.length === 0}
        {#if canManageHotkeys}
          <div class="warning">
            <span class="icon"><IconWarning size={ICON_SIZE_LARGE} /></span>
            <p class="description">{$i18n.sns_neuron_detail.add_hotkey_info}</p>
          </div>
        {:else}
          <p>{$i18n.neuron_detail.no_notkeys}</p>
        {/if}
      {:else}
        <ul>
          {#each hotkeys as hotkey (hotkey)}
            <li data-tid="hotkey-row">
              <Value testId="hotkey-principal">{hotkey}</Value>
              {#if canManageHotkeys}
                <button
                  class="text"
                  aria-label={$i18n.core.remove}
                  on:click={() => maybeRemove(hotkey)}
                  data-tid="remove-hotkey-button"
                  ><IconClose size="18px" /></button
                >
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
      {#if canManageHotkeys && neuronId !== undefined}
        <div class="actions">
          <AddSnsHotkeyButton />
        </div>
      {/if}
    </CardInfo>
  {/if}
</TestIdWrapper>

{#if showConfirmationHotkey !== undefined}
  <!-- The extra const is required for TS to understand that showConfirmationHotkey is a string, not undefined -->
  {@const hotkey = showConfirmationHotkey}
  <ConfirmRemoveCurrentUserHotkey
    on:nnsClose={closeConfirmation}
    on:nnsConfirm={() => remove(hotkey)}
  />
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/card";

  .title {
    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);
  }

  h3 {
    line-height: var(--line-height-standard);
  }

  .warning {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--padding-2x);

    margin-bottom: var(--padding-2x);

    .icon {
      color: var(--warning-emphasis);
    }

    p {
      margin: 0;
    }
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

  .actions {
    display: flex;
    justify-content: flex-start;
  }
</style>
