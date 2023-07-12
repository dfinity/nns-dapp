<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { PageHeader } from "@dfinity/gix-components";
  import UniversePageSummary from "../universe/UniversePageSummary.svelte";
  import IdentifierHash from "../ui/IdentifierHash.svelte";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import { TokenAmount, nonNullish, ICPToken } from "@dfinity/utils";
  import { formatVotingPower, neuronStake } from "$lib/utils/neuron.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { i18n } from "$lib/stores/i18n";
  import { MAX_NEURON_ID_DIGITS } from "$lib/constants/neurons.constants";
  import { NNS_UNIVERSE } from "$lib/derived/selectable-universes.derived";

  export let neuron: NeuronInfo;

  let amount: TokenAmount;
  $: amount = TokenAmount.fromE8s({
    amount: neuronStake(neuron),
    token: ICPToken,
  });
</script>

<PageHeader testId="nns-neuron-page-header-component">
  <UniversePageSummary slot="start" universe={NNS_UNIVERSE} />
  <span slot="end" class="description">
    <IdentifierHash
      identifier={neuron.neuronId.toString()}
      splitLength={MAX_NEURON_ID_DIGITS / 2}
    />
  </span>
  <span slot="title">
    {#if nonNullish(amount)}
      <AmountDisplay {amount} size="huge" singleLine />
    {/if}
  </span>
  <h3 class="description" slot="subtitle" data-tid="voting-power-subtitle">
    {replacePlaceholders($i18n.neuron_detail.voting_power_subtitle, {
      $votingPower: formatVotingPower(neuron.votingPower),
    })}
  </h3>
</PageHeader>
