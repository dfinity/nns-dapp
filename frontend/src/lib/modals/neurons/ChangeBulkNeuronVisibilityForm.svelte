<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import {
    isPublicNeuron,
    isNeuronControllable,
    isPrivateNeuron,
    createNeuronVisibilityCellNeuron,
  } from "$lib/utils/neuron.utils";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import { authStore } from "$lib/stores/auth.store";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { i18n } from "$lib/stores/i18n";
  import NeuronVisibilityCell from "$lib/modals/neurons/NeuronVisibilityCell.svelte";
  import type { NeuronInfo } from "@dfinity/nns";
  import { Checkbox, Spinner } from "@dfinity/gix-components";
  import Separator from "$lib/components/ui/Separator.svelte";

  export let neuron: NeuronInfo;
  const dispatch = createEventDispatcher();

  const cancel = () => {
    dispatch("nnsCancel");
  };

  const nnsSubmit = () => {
    dispatch("nnsSubmit");
  };

  export let selectedNeurons: NeuronInfo[];
  $: selectedNeurons = [neuron];

  let isLoading = false;
  $: isLoading = $neuronsStore.neurons === undefined;

  let applyToAllNeurons: boolean;
  $: applyToAllNeurons = false;

  let isPublic: boolean;
  isPublic = isPublicNeuron(neuron);

  let allNeurons: NeuronInfo[];
  $: allNeurons = $neuronsStore.neurons || [];

  let controllableNeurons: NeuronInfo[];
  $: controllableNeurons = allNeurons.filter(
    (n) =>
      isNeuronControllable({
        neuron: n,
        identity: $authStore.identity,
        accounts: $icpAccountsStore,
      }) &&
      (isPublic ? !isPrivateNeuron(n) : !isPublicNeuron(n)) &&
      n.neuronId !== neuron.neuronId
  );

  let uncontrollableNeurons: NeuronInfo[];
  $: uncontrollableNeurons = allNeurons.filter(
    (n) =>
      !isNeuronControllable({
        neuron: n,
        identity: $authStore.identity,
        accounts: $icpAccountsStore,
      }) && (isPublic ? !isPrivateNeuron(n) : !isPublicNeuron(n))
  );

  $: isNeuronSelected = (n: NeuronInfo) =>
    selectedNeurons.some((selected) => selected.neuronId === n.neuronId);

  function updateApplyToAllNeuronsCheckState() {
    applyToAllNeurons =
      selectedNeurons.length === controllableNeurons.length + 1;
  }

  function handleCheckboxChange(n: NeuronInfo): void {
    if (isNeuronSelected(n)) {
      selectedNeurons = selectedNeurons.filter(
        (selected) => selected.neuronId.toString() !== n.neuronId.toString()
      );
    } else {
      selectedNeurons = [...selectedNeurons, n];
    }

    updateApplyToAllNeuronsCheckState();
  }

  function handleApplyToAllChange(): void {
    if (!applyToAllNeurons) {
      selectedNeurons = [neuron, ...controllableNeurons];
    } else {
      selectedNeurons = [neuron];
    }
    updateApplyToAllNeuronsCheckState();
  }
</script>

<div
  class="change-bulk-visibility-container"
  data-tid="change-bulk-visibility-component"
>
  {#if isLoading}
    <div class="loading-container" data-tid="loading-container">
      <span>
        <Spinner inline />
      </span>
      <p class="description">Retrieving data on neurons...</p>
    </div>
  {:else}
    {#if controllableNeurons.length > 0}
      <div class="apply-to-all" data-tid="apply-to-all-container">
        <Checkbox
          inputId="apply-to-all"
          checked={applyToAllNeurons}
          on:nnsChange={handleApplyToAllChange}
        >
          Apply to all neurons
        </Checkbox>
      </div>
    {/if}
    {#if controllableNeurons.length + uncontrollableNeurons.length > 0}
      <div class="neurons-lists-container" data-tid="neurons-lists-container">
        <div class="neurons-list" data-tid="controllable-neurons-list">
          <p class="description" data-tid="controllable-neurons-description">
            Neurons
          </p>
          {#if controllableNeurons.length > 0}
            {#each controllableNeurons as n (n.neuronId)}
              <div
                class="neuron-row"
                data-tid="neuron-row-{n.neuronId.toString()}"
              >
                <Checkbox
                  inputId={n.neuronId.toString()}
                  checked={isNeuronSelected(n)}
                  on:nnsChange={() => handleCheckboxChange(n)}
                >
                  <NeuronVisibilityCell
                    cellData={createNeuronVisibilityCellNeuron({
                      neuron: n,
                      identity: $authStore.identity,
                      accounts: $icpAccountsStore,
                      i18n: $i18n,
                    })}
                  /></Checkbox
                >
              </div>
            {/each}
          {/if}
        </div>

        {#if uncontrollableNeurons.length > 0}
          <Separator spacing="none" />
          <div class="neurons-list" data-tid="uncontrollable-neurons-list">
            <p
              class="description small"
              data-tid="uncontrollable-neurons-description"
            >
              These neurons have different controllers and won't be updated
            </p>
            {#each uncontrollableNeurons as n (n.neuronId)}
              <div
                class="neuron-row disabled"
                data-tid="uncontrollable-neuron-row-{n.neuronId}"
              >
                <Checkbox
                  inputId="neuron-{n.neuronId}"
                  text="block"
                  checked={false}
                  disabled
                >
                  <NeuronVisibilityCell
                    cellData={createNeuronVisibilityCellNeuron({
                      neuron: n,
                      identity: $authStore.identity,
                      accounts: $icpAccountsStore,
                      i18n: $i18n,
                    })}
                  />
                </Checkbox>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  {/if}

  <div class="toolbar alert footer">
    <button class="secondary" on:click={cancel} data-tid="cancel-button">
      {$i18n.core.cancel}
    </button>
    <button on:click={nnsSubmit} class="primary" data-tid="confirm-button">
      {$i18n.core.confirm}
    </button>
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .loading-container {
    width: 100%;
    min-height: 150px;
    display: flex;
    position: relative;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .neurons-lists-container {
    background: var(--table-header-background);
    border-radius: var(--border-radius);
    padding: 0 var(--padding-2x);
  }

  .change-bulk-visibility-container {
    --checkbox-label-order: 1;
    --checkbox-padding: 0 var(--padding) 0 0;
  }

  .apply-to-all {
    --checkbox-padding: var(--padding) var(--padding) var(--padding-3x) 0;
    --checkbox-label-order: 1;
  }

  .small {
    @include fonts.small;
  }

  .neurons-list {
    display: flex;
    flex-direction: column;
  }

  .neuron-row {
    display: flex;
    &.disabled {
      --disable-contrast: var(--table-divider);
      --value-color: var(--text-description-tint);
      --elements-badges: var(--text-description-tint);
    }
  }
</style>
