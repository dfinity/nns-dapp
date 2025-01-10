<script lang="ts">
  import { selectedTokenStore } from "$lib/derived/selected-token.derived";
  import { authStore } from "$lib/stores/auth.store";
  import { ENABLE_USD_VALUES_FOR_NEURONS } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatVotingPower } from "$lib/utils/neuron.utils";
  import {
    getSnsNeuronStake,
    isUserHotkey,
    snsNeuronVotingPower,
  } from "$lib/utils/sns-neuron.utils";
  import HeadingSubtitle from "$lib/components/common/HeadingSubtitle.svelte";
  import HeadingSubtitleWithUsdValue from "$lib/components/common/HeadingSubtitleWithUsdValue.svelte";
  import PageHeading from "$lib/components/common/PageHeading.svelte";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { Tag } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNervousSystemParameters, SnsNeuron } from "@dfinity/sns";
  import { TokenAmountV2, nonNullish, type Token } from "@dfinity/utils";

  export let neuron: SnsNeuron;
  export let parameters: SnsNervousSystemParameters;
  export let ledgerCanisterId: Principal | undefined;

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
  <svelte:fragment slot="subtitle">
    {#if $ENABLE_USD_VALUES_FOR_NEURONS}
      <HeadingSubtitleWithUsdValue {amount} {ledgerCanisterId}>
        {#if votingPower > 0}
          {replacePlaceholders($i18n.neuron_detail.voting_power_subtitle, {
            $votingPower: formatVotingPower(votingPower),
          })}
        {:else}
          {$i18n.neuron_detail.voting_power_zero_subtitle}
        {/if}
      </HeadingSubtitleWithUsdValue>
    {:else}
      <HeadingSubtitle testId="voting-power">
        {#if votingPower > 0}
          {replacePlaceholders($i18n.neuron_detail.voting_power_subtitle, {
            $votingPower: formatVotingPower(votingPower),
          })}
        {:else}
          {$i18n.neuron_detail.voting_power_zero_subtitle}
        {/if}
      </HeadingSubtitle>
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="tags">
    {#if isHotkey}
      <Tag size="large" testId="hotkey-tag">{$i18n.neurons.hotkey_control}</Tag>
    {/if}
  </svelte:fragment>
</PageHeading>
