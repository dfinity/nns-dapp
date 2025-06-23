<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
  } from "$lib/types/nns-neuron-detail.context";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import { getContext } from "svelte";

  type Props = {
    variant?: "primary" | "secondary";
    isFollowByTopic?: boolean;
  };
  const { variant = "primary", isFollowByTopic = false }: Props = $props();

  const onClick = () => {
    openNnsNeuronModal({
      type: isFollowByTopic ? "follow-by-topic" : "follow",
      data: { neuron: $store.neuron },
    });
  };

  const { store }: NnsNeuronContext = getContext<NnsNeuronContext>(
    NNS_NEURON_CONTEXT_KEY
  );
</script>

<button
  data-tid="follow-neurons-button-component"
  class={variant}
  onclick={onClick}>{$i18n.neuron_detail.follow_neurons}</button
>
