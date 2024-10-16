<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import {
    isPublicNeuron,
    isNeuronControllable,
    createNeuronVisibilityRowData,
  } from "$lib/utils/neuron.utils";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import { authStore } from "$lib/stores/auth.store";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { i18n } from "$lib/stores/i18n";
  import NeuronVisibilityRow from "$lib/modals/neurons/NeuronVisibilityRow.svelte";
  import type { NeuronInfo } from "@dfinity/nns";
  import { Checkbox, Spinner } from "@dfinity/gix-components";
  import Separator from "$lib/components/ui/Separator.svelte";

  export let neuron: NeuronInfo;
  const dispatch = createEventDispatcher();

  const cancel = () => {
    dispatch("nnsCancel");
  };

  const nnsSubmit = () => {
    dispatch("nnsSubmit", { selectedNeurons });
  };

  let selectedNeurons: NeuronInfo[];
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
      (isPublic ? isPublicNeuron(n) : !isPublicNeuron(n)) &&
      n.neuronId !== neuron.neuronId
  );

  let uncontrollableNeurons: NeuronInfo[];
  $: uncontrollableNeurons = allNeurons.filter(
    (n) =>
      !isNeuronControllable({
        neuron: n,
        identity: $authStore.identity,
        accounts: $icpAccountsStore,
      }) && (isPublic ? isPublicNeuron(n) : !isPublicNeuron(n))
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

<form
  class="change-bulk-visibility-container"
  data-tid="change-bulk-visibility-component"
  on:submit|preventDefault={nnsSubmit}
>
  {#if isLoading}
    <div class="loading-container" data-tid="loading-container">
      <span>
        <Spinner inline />
      </span>
      <p class="description">{$i18n.neuron_detail.retrieving_data}</p>
    </div>
  {:else}
    {#if controllableNeurons.length > 0}
      <div class="apply-to-all" data-tid="apply-to-all-container">
        <Checkbox
          inputId="apply-to-all"
          checked={applyToAllNeurons}
          on:nnsChange={handleApplyToAllChange}
        >
          {$i18n.neuron_detail.apply_to_all}
        </Checkbox>
      </div>
    {/if}
    {#if controllableNeurons.length + uncontrollableNeurons.length > 0}
      <div class="neurons-lists-container" data-tid="neurons-lists-container">
        <div class="neurons-list" data-tid="controllable-neurons-list">
          <p class="description" data-tid="controllable-neurons-description">
            {$i18n.neuron_detail.neurons}
          </p>
          {#if controllableNeurons.length > 0}
            {#each controllableNeurons as n (n.neuronId)}
              <div
                class="neuron-row"
                data-tid="neuron-row-{n.neuronId.toString()}"
              >
                <NeuronVisibilityRow
                  rowData={createNeuronVisibilityRowData({
                    neuron: n,
                    identity: $authStore.identity,
                    accounts: $icpAccountsStore,
                    i18n: $i18n,
                  })}
                  checked={isNeuronSelected(n)}
                  on:nnsChange={() => handleCheckboxChange(n)}
                />
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
              {$i18n.neuron_detail.uncontrollable_neurons_description}
            </p>
            {#each uncontrollableNeurons as n (n.neuronId)}
              <NeuronVisibilityRow
                rowData={createNeuronVisibilityRowData({
                  neuron: n,
                  identity: $authStore.identity,
                  accounts: $icpAccountsStore,
                  i18n: $i18n,
                })}
                disabled
              />
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  {/if}

  <div class="toolbar alert footer">
    <button
      class="secondary"
      on:click|preventDefault={cancel}
      data-tid="cancel-button"
    >
      {$i18n.core.cancel}
    </button>
    <button type="submit" class="primary" data-tid="confirm-button">
      {$i18n.core.confirm}
    </button>
  </div>
</form>

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
</style>
