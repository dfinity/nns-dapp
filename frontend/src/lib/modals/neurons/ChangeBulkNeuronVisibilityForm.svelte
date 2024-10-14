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
  import NeuronVisibilityCell from "$lib/components/neurons/NeuronsTable/NeuronVisibilityCell.svelte";
  import type { NeuronInfo } from "@dfinity/nns";
  import { Checkbox, Spinner } from "@dfinity/gix-components";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
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

  let isPublic: Boolean;
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
      (isPublic ? isPublicNeuron(n) : isPrivateNeuron(n)) &&
      n.neuronId !== neuron.neuronId
  );

  let uncontrollableNeurons: NeuronInfo[];
  $: uncontrollableNeurons = allNeurons.filter(
    (n) =>
      !isNeuronControllable({
        neuron: n,
        identity: $authStore.identity,
        accounts: $icpAccountsStore,
      }) && (isPublic ? isPublicNeuron(n) : isPrivateNeuron(n))
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

<TestIdWrapper testId="change-bulk-visibility-form-container">
  <div class="change-bulk-visibility-container">
    {#if isLoading}
      <div class="loading-container">
        <span>
          <Spinner inline />
        </span>
        <p class="description">Retrieving data on neurons...</p>
      </div>
    {:else}
      {#if controllableNeurons.length > 0}
        <div class="apply-to-all">
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
        <div class="neurons-lists-container">
          <div class="neurons-list">
            <p class="description">Neurons</p>
            {#if controllableNeurons.length > 0}
              {#each controllableNeurons as n (n.neuronId)}
                <div class="neuron-row">
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

          <Separator spacing="none" />
          {#if uncontrollableNeurons.length > 0}
            <div class="neurons-list">
              <p class="description small">
                These neurons have different controllers and won’t be updated
              </p>
              {#each uncontrollableNeurons as n (n.neuronId)}
                <div class="neuron-row disabled">
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
  </div></TestIdWrapper
>

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
