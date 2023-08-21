<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import SplitNnsNeuronButton from "./actions/SplitNnsNeuronButton.svelte";
  import {
    ageMultiplier,
    dissolveDelayMultiplier,
    formatVotingPower,
    formattedStakedMaturity,
  } from "$lib/utils/neuron.utils";
  import {
    Html,
    KeyValuePairInfo,
    KeyValuePair,
  } from "@dfinity/gix-components";
  import NnsNeuronCardTitle from "$lib/components/neurons/NnsNeuronCardTitle.svelte";
  import NeuronStateInfo from "$lib/components/neurons/NeuronStateInfo.svelte";
  import NnsNeuronRemainingTime from "$lib/components/neurons/NnsNeuronRemainingTime.svelte";
  import NnsNeuronAge from "$lib/components/neurons/NnsNeuronAge.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import type { IntersectingDetail } from "$lib/types/intersection.types";
  import { onIntersection } from "$lib/directives/intersection.directives";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  export let neuron: NeuronInfo;

  const updateLayoutTitle = ($event: Event) => {
    const {
      detail: { intersecting },
    } = $event as unknown as CustomEvent<IntersectingDetail>;

    layoutTitleStore.set({
      title: $i18n.neuron_detail.title,
      header: intersecting
        ? $i18n.neuron_detail.title
        : `${$i18n.core.icp} – ${neuron.neuronId}`,
    });
  };

  // Note about replacePlaceholders and $st4kedMaturity
  // TODO: placeholders cannot contain ath the moment other placeholders keys - e.g. $stakedMaturity contains $stake would lead to replace errors therefore a distinctive selector $st4kedMaturity
</script>

<TestIdWrapper testId="nns-neuron-meta-info-card-component">
  <div class="content-cell-details">
    <KeyValuePair>
      <div
        slot="key"
        data-tid="neuron-id-title"
        use:onIntersection
        on:nnsIntersecting={updateLayoutTitle}
      >
        <NnsNeuronCardTitle tagName="h3" {neuron} />
      </div>
      <NeuronStateInfo state={neuron.state} slot="value" />
    </KeyValuePair>

    <NnsNeuronAge {neuron} />

    <NnsNeuronRemainingTime {neuron} inline={false} />

    {#if neuron.votingPower}
      <KeyValuePairInfo testId="voting-power">
        <svelte:fragment slot="key"
          >{$i18n.neurons.voting_power}</svelte:fragment
        >
        <span class="value" slot="value" data-tid="voting-power-value"
          >{formatVotingPower(neuron.votingPower)}</span
        >
        <svelte:fragment slot="info">
          {#if neuron.fullNeuron?.cachedNeuronStake !== undefined}
            <Html
              text={replacePlaceholders(
                $i18n.neuron_detail.voting_power_tooltip_with_stake,
                {
                  $token: "ICP",
                  $stake: formatToken({
                    value: neuron.fullNeuron.cachedNeuronStake,
                    detailed: true,
                  }),
                  $st4kedMaturity: formattedStakedMaturity(neuron),
                  $delayMultiplier: dissolveDelayMultiplier(
                    neuron.dissolveDelaySeconds
                  ).toFixed(2),
                  $ageMultiplier: ageMultiplier(neuron.ageSeconds).toFixed(2),
                }
              )}
            />
          {/if}
        </svelte:fragment>
      </KeyValuePairInfo>
    {/if}
  </div>

  <div class="buttons">
    <SplitNnsNeuronButton {neuron} />
  </div>

  <Separator />
</TestIdWrapper>

<style lang="scss">
  .buttons {
    margin: var(--padding-2x) 0 0;
    width: fit-content;
  }

  .content-cell-details {
    gap: var(--padding-1_5x);
  }
</style>
