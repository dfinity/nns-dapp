<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import { TokenAmount, ICPToken } from "@dfinity/utils";
  import {
    formatVotingPower,
    hasJoinedCommunityFund,
    isHotKeyControllable,
    neuronStake,
  } from "$lib/utils/neuron.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { i18n } from "$lib/stores/i18n";
  import PageHeading from "../common/PageHeading.svelte";
  import { NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE } from "$lib/constants/neurons.constants";
  import { authStore } from "$lib/stores/auth.store";
  import HeadingTag from "../common/HeadingTag.svelte";

  export let neuron: NeuronInfo;

  let amount: TokenAmount;
  $: amount = TokenAmount.fromE8s({
    amount: neuronStake(neuron),
    token: ICPToken,
  });

  // The API might return a non-zero voting power even if the neuron can't vote.
  let canVote: boolean;
  $: canVote =
    neuron.dissolveDelaySeconds > BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE);

  let isCommunityFund: boolean;
  $: isCommunityFund = hasJoinedCommunityFund(neuron);

  let isHotKeyControl: boolean;
  $: isHotKeyControl = isHotKeyControllable({
    neuron,
    identity: $authStore.identity,
  });
</script>

<PageHeading testId="nns-neuron-page-heading-component">
  <AmountDisplay slot="title" {amount} size="huge" singleLine />
  <span slot="subtitle" data-tid="voting-power">
    {#if canVote}
      {replacePlaceholders($i18n.neuron_detail.voting_power_subtitle, {
        $votingPower: formatVotingPower(neuron.votingPower),
      })}
    {:else}
      {$i18n.neuron_detail.voting_power_zero_subtitle}
    {/if}
  </span>
  <svelte:fragment slot="tags">
    {#if isCommunityFund}
      <HeadingTag testId="neurons-fund-tag">
        {$i18n.neurons.community_fund}
      </HeadingTag>
    {/if}
    {#if isHotKeyControl}
      <HeadingTag testId="hotkey-tag">
        {$i18n.neurons.hotkey_control}
      </HeadingTag>
    {/if}
  </svelte:fragment>
</PageHeading>
