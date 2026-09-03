<script lang="ts">
  import { goto } from "$app/navigation";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import AddSnsHotkeyButton from "$lib/components/sns-neuron-detail/actions/AddSnsHotkeyButton.svelte";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { ICON_SIZE_LARGE } from "$lib/constants/layout.constants";
  import { neuronsPathStore } from "$lib/derived/paths.derived";
  import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import ConfirmRemoveCurrentUserHotkey from "$lib/modals/neurons/ConfirmRemoveCurrentUserHotkey.svelte";
  import { removeHotkey } from "$lib/services/sns-neurons.services";
  import { authStore } from "$lib/stores/auth.store";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError, toastsShow } from "$lib/stores/toasts.store";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import {
    canIdentityManageHotkeys,
    getSnsNeuronHotkeyPermissionsFor,
    getSnsNeuronHotkeys,
    getSnsNeuronPartialHotkeys,
  } from "$lib/utils/sns-neuron.utils";
  import { IconClose, IconWarning, Value } from "@dfinity/gix-components";
  import type { SnsGovernanceDid } from "@icp-sdk/canisters/sns";
  import { fromDefinedNullable } from "@dfinity/utils";
  import { getContext } from "svelte";

  export let parameters: SnsGovernanceDid.NervousSystemParameters;

  const { reload, store }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let neuron: SnsGovernanceDid.Neuron | undefined | null;
  $: neuron = $store.neuron;
  let neuronId: SnsGovernanceDid.NeuronId | undefined;
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
  type HotkeyRow = { principal: string; complete: boolean };

  // A row is incomplete when the principal holds only some of the hotkey
  // permissions. The card shows it with a warning, so no principal keeps power
  // over the neuron without the user seeing it.
  let rows: HotkeyRow[];
  $: rows =
    neuron !== undefined && neuron !== null
      ? [
          ...getSnsNeuronHotkeys(neuron).map((principal) => ({
            principal,
            complete: true,
          })),
          ...getSnsNeuronPartialHotkeys(neuron).map((principal) => ({
            principal,
            complete: false,
          })),
        ]
      : [];

  let showTooltip: boolean;
  $: showTooltip = rows.length > 0 && canManageHotkeys;

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
    if (neuron === undefined || neuron === null) {
      return;
    }
    startBusy({
      initiator: "remove-sns-hotkey-neuron",
    });
    const { success } = await removeHotkey({
      neuron,
      hotkey,
      rootCanisterId: $selectedUniverseIdStore,
    });
    if (!success) {
      stopBusy("remove-sns-hotkey-neuron");
      return;
    }
    // The reload uses the "update" strategy, so it settles on the certified
    // response. The default strategy settles on the query response. One
    // replica can forge a query response, and a query response can also show
    // the neuron from before the removal.
    await reload({ strategy: "update" });
    // The removal is complete only when the principal keeps no hotkey
    // permission. A neuron that the reload did not deliver counts as
    // incomplete.
    const reloadedNeuron = $store.neuron;
    const complete =
      reloadedNeuron !== undefined &&
      reloadedNeuron !== null &&
      getSnsNeuronHotkeyPermissionsFor({
        neuron: reloadedNeuron,
        principal: hotkey,
      }).length === 0;
    stopBusy("remove-sns-hotkey-neuron");
    if (!complete) {
      // The card keeps the user on the page. The list shows the principal with
      // a warning, so the user can try again.
      toastsError({
        labelKey: "error__sns.sns_remove_hotkey_incomplete",
      });
      return;
    }
    // The user removed its own hotkey. It has no more access to the neuron, so
    // the card reports the result and leaves the page.
    if (currentIdentityString === hotkey) {
      toastsShow({
        level: "success",
        labelKey: "neurons.remove_hotkey_success",
      });

      await goto($neuronsPathStore);
    }
  };
</script>

<TestIdWrapper testId="sns-neuron-hotkeys-card-component">
  {#if neuron !== undefined && neuron !== null}
    <CardInfo noMargin testId="sns-hotkeys-card">
      <div class="title" slot="start">
        <h3>{$i18n.neuron_detail.hotkeys_title}</h3>
        {#if showTooltip}
          <TooltipIcon
            tooltipId="sns-hotkeys-info"
            text={$i18n.sns_neuron_detail.add_hotkey_tooltip}
          />
        {/if}
      </div>
      {#if rows.length === 0}
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
          {#each rows as { principal, complete } (principal)}
            <li data-tid="hotkey-row">
              <div class="principal">
                <Value testId="hotkey-principal">{principal}</Value>
                {#if !complete}
                  <p
                    class="partial-permissions"
                    data-tid="partial-hotkey-warning"
                  >
                    {$i18n.sns_neuron_detail.partial_hotkey_warning}
                  </p>
                {/if}
              </div>
              {#if canManageHotkeys}
                <button
                  class="text"
                  aria-label={$i18n.core.remove}
                  on:click={() => maybeRemove(principal)}
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
    gap: var(--padding);
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

  .principal {
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);
    min-width: 0;
  }

  .partial-permissions {
    margin: 0;
    color: var(--warning-emphasis);
    font-size: var(--font-size-small);
  }

  .actions {
    display: flex;
    justify-content: flex-start;
  }
</style>
