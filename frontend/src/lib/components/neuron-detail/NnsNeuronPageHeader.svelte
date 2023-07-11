<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { PageHeader } from "@dfinity/gix-components";
  import UniversePageSummary from "../universe/UniversePageSummary.svelte";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import IdentifierHash from "../ui/IdentifierHash.svelte";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import { type Token, TokenAmount, nonNullish } from "@dfinity/utils";
  import { tokensStore } from "$lib/stores/tokens.store";
  import type { Universe } from "$lib/types/universe";
  import { formatVotingPower, neuronStake } from "$lib/utils/neuron.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { i18n } from "$lib/stores/i18n";

  export let neuron: NeuronInfo;

  let universe: Universe;
  $: universe = $selectedUniverseStore;

  let token: Token | undefined;
  $: token = $tokensStore[universe.canisterId]?.token;

  let amount: TokenAmount | undefined;
  $: amount = nonNullish(token)
    ? TokenAmount.fromE8s({ amount: neuronStake(neuron), token })
    : undefined;
</script>

<PageHeader>
  <UniversePageSummary slot="start" universe={$selectedUniverseStore} />
  <span slot="end" class="description">
    <IdentifierHash identifier={neuron.neuronId.toString()} />
  </span>
  <span slot="title">
    {#if nonNullish(amount)}
      <AmountDisplay {amount} huge singleLine />
    {/if}
  </span>
  <h3 class="description" slot="subtitle">
    {replacePlaceholders($i18n.neuron_detail.voting_power_subtitle, {
      $votingPower: formatVotingPower(neuron.votingPower),
    })}
  </h3>
</PageHeader>
