<script lang="ts">
  import HeadingSubtitleWithUsdValue from "$lib/components/common/HeadingSubtitleWithUsdValue.svelte";
  import PageHeading from "$lib/components/common/PageHeading.svelte";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import NeuronTag from "$lib/components/ui/NeuronTag.svelte";
  import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import {
    neuronMinimumDissolveDelayToVoteSeconds,
    startReducingVotingPowerAfterSecondsStore,
  } from "$lib/derived/network-economics.derived";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import {
    formatVotingPower,
    getNeuronTags,
    hasEnoughDissolveDelayToVote,
    neuronStake,
    type NeuronTagData,
  } from "$lib/utils/neuron.utils";
  import type { NeuronInfo } from "@icp-sdk/canisters/nns";
  import { ICPToken, TokenAmountV2 } from "@dfinity/utils";

  export let neuron: NeuronInfo;

  let amount: TokenAmountV2;
  $: amount = TokenAmountV2.fromUlps({
    amount: neuronStake(neuron),
    token: ICPToken,
  });

  // The API might return a non-zero voting power even if the neuron can't vote.
  let canVote: boolean;
  $: canVote = hasEnoughDissolveDelayToVote(
    neuron,
    $neuronMinimumDissolveDelayToVoteSeconds
  );

  let neuronTags: NeuronTagData[];
  $: neuronTags = getNeuronTags({
    neuron,
    identity: $authStore.identity,
    accounts: $icpAccountsStore,
    i18n: $i18n,
    startReducingVotingPowerAfterSeconds:
      $startReducingVotingPowerAfterSecondsStore,
    minimumDissolveDelay: $neuronMinimumDissolveDelayToVoteSeconds,
  });
</script>

<PageHeading testId="nns-neuron-page-heading-component">
  <AmountDisplay slot="title" {amount} size="huge" singleLine detailed />
  <svelte:fragment slot="subtitle">
    <HeadingSubtitleWithUsdValue {amount} ledgerCanisterId={LEDGER_CANISTER_ID}>
      {#if canVote}
        {replacePlaceholders($i18n.neuron_detail.voting_power_subtitle, {
          $votingPower: formatVotingPower(neuron.decidingVotingPower ?? 0n),
        })}
      {:else}
        {$i18n.neuron_detail.voting_power_zero_subtitle}
      {/if}
    </HeadingSubtitleWithUsdValue>
  </svelte:fragment>
  <svelte:fragment slot="tags">
    {#each neuronTags as tag}
      <NeuronTag size="large" {tag} />
    {/each}
  </svelte:fragment>
</PageHeading>
