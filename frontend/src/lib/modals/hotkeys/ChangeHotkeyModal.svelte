<script lang="ts">
  import CalloutWarning from "$lib/components/common/CalloutWarning.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import PrincipalInput from "$lib/components/ui/PrincipalInput.svelte";
  import { changeHotkeyOnNeurons } from "$lib/services/hotkeys.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import type {
    Hotkey,
    HotkeyChange,
    HotkeyChangeResult,
    HotkeyNeuronRef,
  } from "$lib/types/hotkeys";
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { Checkbox, Modal } from "@dfinity/gix-components";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import type { Principal } from "@icp-sdk/core/principal";
  import { SvelteSet } from "svelte/reactivity";

  type Props = {
    hotkey: Hotkey;
    type: HotkeyChange["type"];
    onClose: () => void;
  };

  const { hotkey, type, onClose }: Props = $props();

  const toKey = ({ universeId, neuronId }: HotkeyNeuronRef) =>
    `${universeId}:${neuronId}`;

  const isReplace = $derived(type === "replace");

  let newPrincipal = $state<Principal | undefined>();
  const isSameHotkey = $derived(newPrincipal?.toText() === hotkey.principal);

  // All the neurons that the user can change start selected.
  const deselected = new SvelteSet<string>();

  const changeableNeurons = $derived(
    hotkey.projects.flatMap(({ universe, neurons }) =>
      neurons
        .filter(({ canChange }) => canChange)
        .map(({ neuronId }) => ({ universeId: universe.canisterId, neuronId }))
    )
  );

  const selectedNeurons = $derived(
    changeableNeurons.filter((neuron) => !deselected.has(toKey(neuron)))
  );

  const canSubmit = $derived(
    selectedNeurons.length > 0 &&
      (!isReplace || (nonNullish(newPrincipal) && !isSameHotkey))
  );

  const toggle = (neuron: HotkeyNeuronRef) => {
    const key = toKey(neuron);
    if (deselected.has(key)) {
      deselected.delete(key);
    } else {
      deselected.add(key);
    }
  };

  const countSelected = (universeId: string) =>
    selectedNeurons.filter((neuron) => neuron.universeId === universeId).length;

  let change = $state<HotkeyChange | undefined>();
  let results = $state<HotkeyChangeResult[] | undefined>();

  const failedNeurons = $derived(
    (results ?? []).filter(({ success }) => !success)
  );

  const run = async ({
    change,
    neurons,
  }: {
    change: HotkeyChange;
    neurons: HotkeyNeuronRef[];
  }) => {
    startBusy({ initiator: "change-hotkeys", labelKey: "hotkeys.changing" });
    try {
      const newResults = await changeHotkeyOnNeurons({ change, neurons });
      // A retry only runs the failed neurons, so keep the other results.
      results =
        results?.map(
          (result) =>
            newResults.find(
              (newResult) => toKey(newResult) === toKey(result)
            ) ?? result
        ) ?? newResults;
    } finally {
      stopBusy("change-hotkeys");
    }
  };

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    change =
      isReplace && nonNullish(newPrincipal)
        ? {
            type: "replace",
            principal: hotkey.principal,
            newPrincipal: newPrincipal.toText(),
          }
        : { type: "remove", principal: hotkey.principal };
    run({ change, neurons: selectedNeurons });
  };

  const retry = () => {
    if (isNullish(change)) {
      return;
    }
    run({
      change,
      neurons: failedNeurons.map(({ universeId, neuronId }) => ({
        universeId,
        neuronId,
      })),
    });
  };

  const getProjectTitle = (universeId: string) =>
    hotkey.projects.find(({ universe }) => universe.canisterId === universeId)
      ?.universe.title ?? universeId;
</script>

<Modal {onClose} testId="change-hotkey-modal">
  {#snippet title()}
    {isReplace ? $i18n.hotkeys.replace_title : $i18n.hotkeys.remove_title}
  {/snippet}

  {#if isNullish(results)}
    <form onsubmit={submit} data-tid="change-hotkey-form">
      <div class="field">
        <p class="label">{$i18n.hotkeys.current_hotkey}</p>
        <p class="principal" data-tid="current-hotkey">{hotkey.principal}</p>
      </div>

      {#if isReplace}
        <div class="field">
          <PrincipalInput
            bind:principal={newPrincipal}
            placeholderLabelKey="hotkeys.new_hotkey_placeholder"
            name="new-hotkey"
            testId="new-hotkey-input"
          >
            <span slot="label">{$i18n.hotkeys.new_hotkey}</span>
          </PrincipalInput>
          {#if isSameHotkey}
            <p class="error" data-tid="same-hotkey-error">
              {$i18n.hotkeys.same_hotkey_error}
            </p>
          {/if}
          <CalloutWarning htmlText={$i18n.hotkeys.new_hotkey_warning} />
        </div>
      {/if}

      <div class="field">
        <p class="label">{$i18n.hotkeys.neurons_to_change}</p>
        {#each hotkey.projects as { universe, neurons } (universe.canisterId)}
          <div class="project" data-tid="hotkey-neurons-project">
            <div class="project-title">
              <Logo
                src={universe.logo}
                alt={universe.title}
                size="small"
                framed
              />
              <span data-tid="project-title">{universe.title}</span>
              <span class="count" data-tid="project-selected-count"
                >{replacePlaceholders($i18n.hotkeys.selected_neurons, {
                  $selected: countSelected(universe.canisterId).toString(),
                  $total: neurons.length.toString(),
                })}</span
              >
            </div>
            {#each neurons as neuron (neuron.neuronId)}
              {@const ref = {
                universeId: universe.canisterId,
                neuronId: neuron.neuronId,
              }}
              <Checkbox
                inputId={`hotkey-neuron-${toKey(ref)}`}
                testId="hotkey-neuron-checkbox"
                checked={neuron.canChange && !deselected.has(toKey(ref))}
                disabled={!neuron.canChange}
                on:nnsChange={() => toggle(ref)}
              >
                <span class="neuron">
                  <span class="neuron-id"
                    >{shortenWithMiddleEllipsis(neuron.neuronId)}</span
                  >
                  {#if !neuron.canChange}
                    <span class="reason" data-tid="cannot-change"
                      >{$i18n.hotkeys.cannot_change}</span
                    >
                  {/if}
                </span>
              </Checkbox>
            {/each}
          </div>
        {/each}
      </div>

      <div class="toolbar">
        <button
          type="button"
          class="secondary"
          data-tid="cancel-button"
          onclick={onClose}>{$i18n.core.cancel}</button
        >
        <button
          type="submit"
          class={isReplace ? "primary" : "danger"}
          data-tid="confirm-button"
          disabled={!canSubmit}
          >{replacePlaceholders(
            isReplace
              ? $i18n.hotkeys.replace_on_neurons
              : $i18n.hotkeys.remove_from_neurons,
            { $count: selectedNeurons.length.toString() }
          )}</button
        >
      </div>
    </form>
  {:else}
    <div class="result" data-tid="change-hotkey-result">
      {#if failedNeurons.length === 0}
        <p data-tid="result-success">
          {replacePlaceholders($i18n.hotkeys.result_success, {
            $count: results.length.toString(),
          })}
        </p>
      {:else}
        <p data-tid="result-partial">
          {replacePlaceholders($i18n.hotkeys.result_partial, {
            $success: (results.length - failedNeurons.length).toString(),
            $total: results.length.toString(),
          })}
        </p>
        <ul class="failed-neurons">
          {#each failedNeurons as failed (toKey(failed))}
            <li data-tid="failed-neuron">
              {getProjectTitle(failed.universeId)}
              <span class="neuron-id"
                >{shortenWithMiddleEllipsis(failed.neuronId)}</span
              >
            </li>
          {/each}
        </ul>
      {/if}

      <div class="toolbar">
        {#if failedNeurons.length > 0}
          <button class="secondary" data-tid="retry-button" onclick={retry}
            >{$i18n.hotkeys.retry}</button
          >
        {/if}
        <button class="primary" data-tid="close-button" onclick={onClose}
          >{$i18n.core.close}</button
        >
      </div>
    </div>
  {/if}
</Modal>

<style lang="scss">
  form,
  .field,
  .result {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  .result {
    gap: var(--padding-2x);
  }

  form {
    gap: var(--padding-3x);
  }

  p {
    margin: 0;
  }

  .label,
  .count,
  .reason {
    color: var(--text-description);
  }

  .principal {
    word-break: break-all;
  }

  .error {
    color: var(--negative-emphasis);
  }

  .project {
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);
  }

  .project-title {
    display: flex;
    align-items: center;
    gap: var(--padding);
  }

  .count {
    margin-left: auto;
  }

  .neuron {
    display: flex;
    flex-wrap: wrap;
    gap: var(--padding);
  }

  .neuron-id {
    font-family: monospace;
  }

  .failed-neurons {
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);
    margin: 0;
    padding-left: var(--padding-2x);
  }
</style>
