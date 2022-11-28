<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { hasJoinedCommunityFund } from "$lib/utils/neuron.utils";
  import { Checkbox } from "@dfinity/gix-components";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
  } from "$lib/types/nns-neuron-detail.context";
  import { getContext } from "svelte";

  export let neuron: NeuronInfo;

  let isCommunityFund: boolean;
  $: isCommunityFund = hasJoinedCommunityFund(neuron);

  const { toggleModal }: NnsNeuronContext = getContext<NnsNeuronContext>(
    NNS_NEURON_CONTEXT_KEY
  );
</script>

<Checkbox
  preventDefault
  inputId="join-community-fund-checkbox"
  checked={isCommunityFund}
  on:nnsChange={() => toggleModal("join-community-fund")}
>
  <span>{$i18n.neuron_detail.participate_community_fund}</span>
</Checkbox>
