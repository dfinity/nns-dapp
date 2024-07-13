<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
  } from "$lib/types/nns-neuron-detail.context";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import { hasJoinedCommunityFund } from "$lib/utils/neuron.utils";
  import { Checkbox } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { getContext } from "svelte";

  export let neuron: NeuronInfo;
  export let disabled = false;

  let isCommunityFund: boolean;
  $: isCommunityFund = hasJoinedCommunityFund(neuron);

  const { store }: NnsNeuronContext = getContext<NnsNeuronContext>(
    NNS_NEURON_CONTEXT_KEY
  );
</script>

<Checkbox
  testId="join-community-fund-checkbox-component"
  {disabled}
  preventDefault
  inputId="join-community-fund-checkbox"
  checked={isCommunityFund}
  on:nnsChange={() =>
    openNnsNeuronModal({
      type: "join-community-fund",
      data: { neuron: $store.neuron },
    })}
>
  <span>{$i18n.neuron_detail.participate_community_fund}</span>
</Checkbox>
