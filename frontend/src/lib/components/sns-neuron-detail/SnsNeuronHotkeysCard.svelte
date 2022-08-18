<script lang="ts">
  import type { SnsNeuron, SnsNeuronId } from "@dfinity/sns";
  import { fromDefinedNullable } from "@dfinity/utils";
  import { getContext } from "svelte";
  import { ICON_SIZE_LARGE } from "../../constants/style.constants";
  import { IconClose } from "@dfinity/gix-components";
  import IconInfo from "../../icons/IconInfo.svelte";
  import IconWarning from "../../icons/IconWarning.svelte";
  import { removeHotkey } from "../../services/sns-neurons.services";
  import { authStore } from "../../stores/auth.store";
  import { startBusy, stopBusy } from "../../stores/busy.store";
  import { i18n } from "../../stores/i18n";
  import { snsProjectSelectedStore } from "../../stores/projects.store";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "../../types/sns-neuron-detail.context";
  import {
    getSnsNeuronHotkeys,
    canIdentityManageHotkeys,
  } from "../../utils/sns-neuron.utils";
  import CardInfo from "../ui/CardInfo.svelte";
  import Tooltip from "../ui/Tooltip.svelte";
  import Value from "../ui/Value.svelte";
  import AddSnsHotkeyButton from "./actions/AddSnsHotkeyButton.svelte";

  const { reload, store }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let neuron: SnsNeuron | undefined;
  $: neuron = $store.neuron;
  let neuronId: SnsNeuronId | undefined;
  $: neuronId =
    neuron?.id !== undefined ? fromDefinedNullable(neuron.id) : undefined;

  let canManageHotkeys: boolean = true;
  $: canManageHotkeys =
    neuron !== undefined
      ? canIdentityManageHotkeys({
          neuron,
          identity: $authStore.identity,
        })
      : false;
  let hotkeys: string[];
  $: hotkeys = neuron !== undefined ? getSnsNeuronHotkeys(neuron) : [];

  let showTooltip: boolean;
  $: showTooltip = hotkeys.length > 0 && canManageHotkeys;

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
      rootCanisterId: $snsProjectSelectedStore,
    });
    if (success) {
      await reload({ forceFetch: true });
    }
    stopBusy("remove-sns-hotkey-neuron");
  };
</script>

{#if neuron !== undefined}
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
          <li>
            <Value>{hotkey}</Value>
            {#if canManageHotkeys}
              <button
                class="text"
                aria-label={$i18n.core.remove}
                on:click={() => remove(hotkey)}
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

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/card";
  .title {
    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);
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
