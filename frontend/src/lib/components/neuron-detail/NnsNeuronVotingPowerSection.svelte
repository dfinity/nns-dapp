<script lang="ts">
  import { Section } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { ICPToken, TokenAmount } from "@dfinity/utils";
  import { formatVotingPower, neuronStake } from "$lib/utils/neuron.utils";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import StakeItemAction from "./StakeItemAction.svelte";

  export let neuron: NeuronInfo;

  let amount: TokenAmount;
  $: amount = TokenAmount.fromE8s({
    amount: neuronStake(neuron),
    token: ICPToken,
  });
</script>

<Section>
  <h3 slot="title">{$i18n.neurons.voting_power}</h3>
  <h3 slot="end">{formatVotingPower(neuron.votingPower)}</h3>
  <p slot="description">
    {replacePlaceholders($i18n.neuron_detail.voting_power_section_description, {
      $token: ICPToken.symbol,
    })}
  </p>
  <ul class="content">
    <StakeItemAction {neuron} />
  </ul>
</Section>

<style lang="scss">
  h3,
  p {
    margin: 0;
  }
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding);

    padding: 0;
  }
</style>
