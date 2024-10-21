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
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { changeNeuronVisibility } from "$lib/services/neurons.services";
  import Separator from "$lib/components/ui/Separator.svelte";

  const dispatch = createEventDispatcher();

  const cancel = () => {
    dispatch("nnsCancel");
  };

  let selectedNeurons: NeuronInfo[];
  $: selectedNeurons = [];

  let isLoading = false;
  $: isLoading = $neuronsStore.neurons === undefined;

  let applyToAllNeurons: boolean;
  $: applyToAllNeurons = false;

  let allNeurons: NeuronInfo[];
  $: allNeurons = $neuronsStore.neurons || [];

  let controllablePrivateNeurons: NeuronInfo[];
  $: controllablePrivateNeurons = allNeurons.filter(
    (n) =>
      isNeuronControllable({
        neuron: n,
        identity: $authStore.identity,
        accounts: $icpAccountsStore,
      }) && !isPublicNeuron(n)
  );

  let uncontrollablePrivateNeurons: NeuronInfo[];
  $: uncontrollablePrivateNeurons = allNeurons.filter(
    (n) =>
      !isNeuronControllable({
        neuron: n,
        identity: $authStore.identity,
        accounts: $icpAccountsStore,
      }) && !isPublicNeuron(n)
  );

  $: isNeuronSelected = (n: NeuronInfo) =>
    selectedNeurons.some((selected) => selected.neuronId === n.neuronId);

  function updateApplyToAllNeuronsCheckState() {
    applyToAllNeurons =
      selectedNeurons.length === controllablePrivateNeurons.length;
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
      selectedNeurons = [...controllablePrivateNeurons];
    } else {
      selectedNeurons = [];
    }
    updateApplyToAllNeuronsCheckState();
  }

  const handleChangeVisibility = async () => {
    startBusy({
      initiator: "change-neuron-visibility",
      labelKey: "neuron_detail.change_neuron_visibility_loading",
    });

    try {
      const { success } = await changeNeuronVisibility({
        neurons: selectedNeurons,
        makePublic: true,
      });
      if (success) {
        toastsSuccess({
          labelKey: "neuron_detail.change_neuron_public_success",
        });

        close();
      } else {
        throw new Error("Error changing neuron visibility");
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
    } finally {
      stopBusy("change-neuron-visibility");
    }
  };
</script>

<form
  data-tid="make-neurons-public-form-component"
  on:submit|preventDefault={() => handleChangeVisibility()}
>
  {#if isLoading}
    <div class="loading-container" data-tid="loading-container">
      <span>
        <Spinner inline />
      </span>
      <p class="description">{$i18n.neuron_detail.retrieving_data}</p>
    </div>
  {:else}
    {#if controllablePrivateNeurons.length > 1}
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
    {#if controllablePrivateNeurons.length + uncontrollablePrivateNeurons.length > 0}
      <div class="neurons-lists-container" data-tid="neurons-lists-container">
        <div class="neurons-list" data-tid="controllable-neurons-list">
          <p class="description" data-tid="controllable-neurons-description">
            {$i18n.neuron_detail.neurons}
          </p>
          {#if controllablePrivateNeurons.length > 0}
            {#each controllablePrivateNeurons as n (n.neuronId)}
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

        {#if uncontrollablePrivateNeurons.length > 0}
          <Separator spacing="none" />
          <div class="neurons-list" data-tid="uncontrollable-neurons-list">
            <p
              class="description small"
              data-tid="uncontrollable-neurons-description"
            >
              {$i18n.neuron_detail.uncontrollable_neurons_description}
            </p>
            {#each uncontrollablePrivateNeurons as n (n.neuronId)}
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
    <button
      type="submit"
      class="primary"
      data-tid="confirm-button"
      disabled={selectedNeurons.length === 0}
    >
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
