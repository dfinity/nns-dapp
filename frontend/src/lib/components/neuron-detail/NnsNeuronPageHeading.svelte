<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import { TokenAmount, ICPToken } from "@dfinity/utils";
  import { formatVotingPower, neuronStake } from "$lib/utils/neuron.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { i18n } from "$lib/stores/i18n";

  export let neuron: NeuronInfo;

  let amount: TokenAmount;
  $: amount = TokenAmount.fromE8s({
    amount: neuronStake(neuron),
    token: ICPToken,
  });
</script>

<div class="container" data-tid="nns-neuron-page-heading-component">
  <AmountDisplay {amount} size="huge" singleLine />
  <h3 class="description" data-tid="voting-power-subtitle">
    {replacePlaceholders($i18n.neuron_detail.voting_power_subtitle, {
      $votingPower: formatVotingPower(neuron.votingPower),
    })}
  </h3>
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    gap: var(--padding-1_5x);
    justify-content: center;
    align-items: center;

    width: 100%;

    h3 {
      margin: 0;
      font-weight: normal;
    }
  }
</style>
