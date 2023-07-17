<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import { TokenAmount, ICPToken } from "@dfinity/utils";
  import { formatVotingPower, neuronStake } from "$lib/utils/neuron.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { i18n } from "$lib/stores/i18n";
  import PageHeading from "../common/PageHeading.svelte";

  export let neuron: NeuronInfo;

  let amount: TokenAmount;
  $: amount = TokenAmount.fromE8s({
    amount: neuronStake(neuron),
    token: ICPToken,
  });
</script>

<PageHeading testId="nns-neuron-page-heading-component">
  <AmountDisplay slot="title" {amount} size="huge" singleLine />
  <svelte:fragment slot="subtitle">
    {replacePlaceholders($i18n.neuron_detail.voting_power_subtitle, {
      $votingPower: formatVotingPower(neuron.votingPower),
    })}
  </svelte:fragment>
</PageHeading>
