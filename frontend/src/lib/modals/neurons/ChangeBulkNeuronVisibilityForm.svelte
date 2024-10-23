<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import {
    isPublicNeuron,
    isNeuronControllableByUser,
    createNeuronVisibilityRowData,
  } from "$lib/utils/neuron.utils";
  import { definedNeuronsStore } from "$lib/stores/neurons.store";
  import { authStore } from "$lib/stores/auth.store";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { i18n } from "$lib/stores/i18n";
  import NeuronVisibilityRow from "$lib/modals/neurons/NeuronVisibilityRow.svelte";
  import type { NeuronInfo } from "@dfinity/nns";
  import { Checkbox, Spinner } from "@dfinity/gix-components";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { nonNullish } from "@dfinity/utils";

  export let defaultSelectedNeuron: NeuronInfo | null = null;
  export let makePublic: boolean;

  const dispatch = createEventDispatcher();

  const cancel = () => {
    dispatch("nnsCancel");
  };

  const nnsSubmit = () => {
    dispatch("nnsSubmit", { selectedNeurons });
  };

  let selectedNeurons: NeuronInfo[];
  $: selectedNeurons = nonNullish(defaultSelectedNeuron)
    ? [defaultSelectedNeuron]
    : [];

  let isLoading = false;
  $: isLoading = $definedNeuronsStore.length === 0;

  let applyToAllNeurons: boolean;
  $: applyToAllNeurons = false;

  let allNeurons: NeuronInfo[];
  $: allNeurons = $definedNeuronsStore || [];

  let controllableNeurons: NeuronInfo[];
  $: controllableNeurons = allNeurons.filter(
    (n) =>
      isNeuronControllableByUser({
        neuron: n,
        mainAccount: $icpAccountsStore.main,
      }) && (makePublic ? !isPublicNeuron(n) : isPublicNeuron(n))
  );

  let uncontrollableNeurons: NeuronInfo[];
  $: uncontrollableNeurons = allNeurons.filter(
    (n) =>
      !isNeuronControllableByUser({
        neuron: n,
        mainAccount: $icpAccountsStore.main,
      }) && (makePublic ? !isPublicNeuron(n) : isPublicNeuron(n))
  );

  $: isNeuronSelected = (n: NeuronInfo) =>
    selectedNeurons.some((selected) => selected.neuronId === n.neuronId);

  function updateApplyToAllNeuronsCheckState() {
    applyToAllNeurons = selectedNeurons.length === controllableNeurons.length;
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
      selectedNeurons = [...controllableNeurons];
    } else {
      selectedNeurons = [];
    }
    updateApplyToAllNeuronsCheckState();
  }
</script>

<form
  class="visibility-form-component"
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
    {#if controllableNeurons.length > 1}
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
            {/each}
          {/if}
        </div>

        {#if uncontrollableNeurons.length > 0}
          <Separator spacing="none" />
          <div
            class="neurons-list uncontrolled"
            data-tid="uncontrollable-neurons-list"
          >
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

  <div class="toolbar footer">
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

  .visibility-form-component {
    row-gap: var(--padding-3x);
  }

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
  }
  .apply-to-all {
    --checkbox-padding: 0;
    --checkbox-label-order: 1;
  }

  .small {
    @include fonts.small;
  }

  .neurons-list {
    padding: 0 var(--padding-2x);
    display: flex;
    flex-direction: column;
    &.uncontrolled {
      padding-top: var(--padding);
    }
  }
</style>
