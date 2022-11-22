<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import SplitNeuronButton from "./actions/SplitNeuronButton.svelte";
  import { authStore } from "$lib/stores/auth.store";
  import {
    ageMultiplier,
    dissolveDelayMultiplier,
    formatVotingPower,
    isHotKeyControllable,
    isNeuronControllable,
    isNeuronControllableByUser,
    formattedStakedMaturity,
  } from "$lib/utils/neuron.utils";
  import { accountsStore } from "$lib/stores/accounts.store";
  import {
    Html,
    KeyValuePairInfo,
    KeyValuePair,
  } from "@dfinity/gix-components";
  import NnsNeuronCardTitle from "$lib/components/neurons/NnsNeuronCardTitle.svelte";
  import NeuronStateInfo from "$lib/components/neurons/NeuronStateInfo.svelte";
  import NnsNeuronRemainingTime from "$lib/components/neurons/NnsNeuronRemainingTime.svelte";
  import NnsNeuronAge from "$lib/components/neurons/NnsNeuronAge.svelte";

  export let neuron: NeuronInfo;

  let isControlledByUser: boolean;
  $: isControlledByUser = isNeuronControllableByUser({
    neuron,
    mainAccount: $accountsStore.main,
  });

  // Note about replacePlaceholders and $st4kedMaturity
  // TODO: placeholders cannot contain ath the moment other placeholders keys - e.g. $stakedMaturity contains $stake would lead to replace errors therefore a distinctive selector $st4kedMaturity
</script>

<section>
  <KeyValuePair>
    <h3 class="label" slot="key"><NnsNeuronCardTitle {neuron} /></h3>
    <div slot="value">
      <NeuronStateInfo state={neuron.state} />
    </div>
  </KeyValuePair>

  <NnsNeuronRemainingTime {neuron} inline={false} />

  <NnsNeuronAge {neuron} />

  {#if neuron.votingPower}
    <KeyValuePairInfo testId="voting-power">
      <svelte:fragment slot="key"
      >{$i18n.neurons.voting_power}</svelte:fragment
      >
      <span class="value" slot="value"
      >{formatVotingPower(neuron.votingPower)}</span
      >
      <svelte:fragment slot="info">
        {#if neuron.fullNeuron?.cachedNeuronStake !== undefined}
          <Html
                  text={replacePlaceholders(
                $i18n.neuron_detail.voting_power_tooltip_with_stake,
                {
                  $stake: formatToken({
                    value: neuron.fullNeuron.cachedNeuronStake,
                    detailed: true,
                  }),
                  $st4kedMaturity: formattedStakedMaturity(neuron),
                  $delayMultiplier: dissolveDelayMultiplier(
                    Number(neuron.dissolveDelaySeconds)
                  ).toFixed(2),
                  $ageMultiplier: ageMultiplier(
                    Number(neuron.ageSeconds)
                  ).toFixed(2),
                }
              )}
          />
        {/if}
      </svelte:fragment>
    </KeyValuePairInfo>
  {/if}

  <div class="buttons">
    {#if isControlledByUser}
      <SplitNeuronButton {neuron} />
    {/if}
  </div>
</section>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  section {
    padding: var(--padding) 0 0 0;
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  .buttons {
    display: flex;
    gap: var(--padding);
    align-items: center;
    justify-content: flex-start;
  }
</style>
