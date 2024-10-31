<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import MakeNeuronsPublicBanner from "$lib/components/neurons/MakeNeuronsPublicBanner.svelte";
  import NeuronsTable from "$lib/components/neurons/NeuronsTable/NeuronsTable.svelte";
  import EmptyMessage from "$lib/components/ui/EmptyMessage.svelte";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { listNeurons } from "$lib/services/neurons.services";
  import { authStore } from "$lib/stores/auth.store";
  import { ENABLE_NEURON_VISIBILITY } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import { definedNeuronsStore, neuronsStore } from "$lib/stores/neurons.store";
  import type { TableNeuron } from "$lib/types/neurons-table";
  import { tableNeuronsFromNeuronInfos } from "$lib/utils/neurons-table.utils";
  import { Spinner } from "@dfinity/gix-components";
  import { onMount } from "svelte";

  let isLoading = false;
  $: isLoading = $neuronsStore.neurons === undefined;

  onMount(() => {
    listNeurons();
  });

  let tableNeurons: TableNeuron[] = [];
  $: tableNeurons = tableNeuronsFromNeuronInfos({
    identity: $authStore.identity,
    accounts: $icpAccountsStore,
    i18n: $i18n,
    neuronInfos: $definedNeuronsStore,
  });
</script>

<TestIdWrapper testId="nns-neurons-component">
  {#if isLoading}
    <Spinner />
  {:else if tableNeurons.length > 0}
    {#if $ENABLE_NEURON_VISIBILITY}
      <MakeNeuronsPublicBanner />
    {/if}
    <NeuronsTable neurons={tableNeurons} />
  {:else}
    <EmptyMessage>{$i18n.neurons.text}</EmptyMessage>
  {/if}
</TestIdWrapper>
