<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { accountsStore } from "../../stores/accounts.store";
  import {
    hasJoinedCommunityFund,
    isNeuronControllableByUser,
  } from "../../utils/neuron.utils";
  import CardInfo from "../ui/CardInfo.svelte";
  import JoinCommunityFundButton from "./actions/JoinCommunityFundButton.svelte";

  export let neuron: NeuronInfo;

  let isCommunityFund: boolean;
  $: isCommunityFund = hasJoinedCommunityFund(neuron);
  let isControlledByUser: boolean;
  $: isControlledByUser = isNeuronControllableByUser({
    neuron,
    mainAccount: $accountsStore.main,
  });
</script>

{#if !isCommunityFund && isControlledByUser}
  <CardInfo>
    <div>
      <JoinCommunityFundButton neuronId={neuron.neuronId} />
    </div>
  </CardInfo>
{/if}

<style lang="scss">
  div {
    display: flex;
    justify-content: flex-start;
  }
</style>
