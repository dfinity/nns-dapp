<script lang="ts">
  import NeuronTag from "$lib/components/ui/NeuronTag.svelte";
  import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE } from "$lib/constants/neurons.constants";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { authStore } from "$lib/stores/auth.store";
  import { ENABLE_USD_VALUES_FOR_NEURONS } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import {
    formatVotingPower,
    getNeuronTags,
    neuronStake,
    type NeuronTagData,
  } from "$lib/utils/neuron.utils";
  import HeadingSubtitle from "$lib/components/common/HeadingSubtitle.svelte";
  import HeadingSubtitleWithUsdValue from "$lib/components/common/HeadingSubtitleWithUsdValue.svelte";
  import PageHeading from "$lib/components/common/PageHeading.svelte";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import type { NeuronInfo } from "@dfinity/nns";
  import { ICPToken, TokenAmountV2 } from "@dfinity/utils";

  export let neuron: NeuronInfo;

  let amount: TokenAmountV2;
  $: amount = TokenAmountV2.fromUlps({
    amount: neuronStake(neuron),
    token: ICPToken,
  });

  // The API might return a non-zero voting power even if the neuron can't vote.
  let canVote: boolean;
  $: canVote =
    neuron.dissolveDelaySeconds >= BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE);

  let neuronTags: NeuronTagData[];
  $: neuronTags = getNeuronTags({
    neuron,
    identity: $authStore.identity,
    accounts: $icpAccountsStore,
    i18n: $i18n,
  });
</script>

<PageHeading testId="nns-neuron-page-heading-component">
  <AmountDisplay slot="title" {amount} size="huge" singleLine detailed />
  <svelte:fragment slot="subtitle">
    {#if $ENABLE_USD_VALUES_FOR_NEURONS}
      <HeadingSubtitleWithUsdValue
        {amount}
        ledgerCanisterId={LEDGER_CANISTER_ID}
      >
        {#if canVote}
          {replacePlaceholders($i18n.neuron_detail.voting_power_subtitle, {
            $votingPower: formatVotingPower(neuron.decidingVotingPower ?? 0n),
          })}
        {:else}
          {$i18n.neuron_detail.voting_power_zero_subtitle}
        {/if}
      </HeadingSubtitleWithUsdValue>
    {:else}
      <HeadingSubtitle testId="voting-power">
        {#if canVote}
          {replacePlaceholders($i18n.neuron_detail.voting_power_subtitle, {
            $votingPower: formatVotingPower(neuron.decidingVotingPower ?? 0n),
          })}
        {:else}
          {$i18n.neuron_detail.voting_power_zero_subtitle}
        {/if}
      </HeadingSubtitle>
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="tags">
    {#each neuronTags as tag}
      <NeuronTag size="large" {tag} />
    {/each}
  </svelte:fragment>
</PageHeading>
