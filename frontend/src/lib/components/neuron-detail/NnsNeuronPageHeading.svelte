<script lang="ts">
  import { NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE } from "$lib/constants/neurons.constants";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import {
    formatVotingPower,
    getNeuronTags,
    neuronStake,
    type NeuronTagData,
  } from "$lib/utils/neuron.utils";
  import HeadingSubtitle from "../common/HeadingSubtitle.svelte";
  import PageHeading from "../common/PageHeading.svelte";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import { Tag } from "@dfinity/gix-components";
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
  <HeadingSubtitle slot="subtitle" testId="voting-power">
    {#if canVote}
      {replacePlaceholders($i18n.neuron_detail.voting_power_subtitle, {
        $votingPower: formatVotingPower(neuron.votingPower),
      })}
    {:else}
      {$i18n.neuron_detail.voting_power_zero_subtitle}
    {/if}
  </HeadingSubtitle>
  <svelte:fragment slot="tags">
    {#each neuronTags as tag}
      <Tag size="large" testId="neuron-tag">{tag.text}</Tag>
    {/each}
  </svelte:fragment>
</PageHeading>
