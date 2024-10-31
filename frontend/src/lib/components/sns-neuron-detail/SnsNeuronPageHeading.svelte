<script lang="ts">
  import { selectedTokenStore } from "$lib/derived/selected-token.derived";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatVotingPower } from "$lib/utils/neuron.utils";
  import {
    getSnsNeuronStake,
    isUserHotkey,
    snsNeuronVotingPower,
  } from "$lib/utils/sns-neuron.utils";
  import HeadingSubtitle from "../common/HeadingSubtitle.svelte";
  import PageHeading from "../common/PageHeading.svelte";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import { Tag } from "@dfinity/gix-components";
  import type { SnsNervousSystemParameters, SnsNeuron } from "@dfinity/sns";
  import { TokenAmountV2, nonNullish, type Token } from "@dfinity/utils";

  export let neuron: SnsNeuron;
  export let parameters: SnsNervousSystemParameters;

  let token: Token | undefined;
  $: token = $selectedTokenStore;

  let amount: TokenAmountV2 | undefined;
  $: amount =
    nonNullish(token) && nonNullish(neuron)
      ? TokenAmountV2.fromUlps({
          amount: getSnsNeuronStake(neuron),
          token: token,
        })
      : undefined;

  let votingPower: number;
  $: votingPower = snsNeuronVotingPower({ neuron, snsParameters: parameters });

  let isHotkey: boolean;
  $: isHotkey = isUserHotkey({
    neuron,
    identity: $authStore.identity,
  });
</script>

<PageHeading testId="sns-neuron-page-heading-component">
  <svelte:fragment slot="title">
    {#if nonNullish(amount)}
      <AmountDisplay {amount} size="huge" singleLine detailed />
    {/if}
  </svelte:fragment>
  <HeadingSubtitle slot="subtitle" testId="voting-power">
    {#if votingPower > 0}
      {replacePlaceholders($i18n.neuron_detail.voting_power_subtitle, {
        $votingPower: formatVotingPower(votingPower),
      })}
    {:else}
      {$i18n.neuron_detail.voting_power_zero_subtitle}
    {/if}
  </HeadingSubtitle>
  <svelte:fragment slot="tags">
    {#if isHotkey}
      <Tag size="large" testId="hotkey-tag">{$i18n.neurons.hotkey_control}</Tag>
    {/if}
  </svelte:fragment>
</PageHeading>
