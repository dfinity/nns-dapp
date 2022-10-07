<script lang="ts">
  import { NeuronState } from "@dfinity/nns";
  import type { NeuronInfo } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { secondsToDate } from "$lib/utils/date.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatToken } from "$lib/utils/icp.utils";
  import NeuronCard from "../neurons/NeuronCard.svelte";
  import IncreaseDissolveDelayButton from "./actions/IncreaseDissolveDelayButton.svelte";
  import IncreaseStakeButton from "./actions/IncreaseStakeButton.svelte";
  import SplitNeuronButton from "./actions/SplitNeuronButton.svelte";
  import DissolveActionButton from "./actions/DissolveActionButton.svelte";
  import DisburseButton from "./actions/DisburseButton.svelte";
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
  import Value from "$lib/components/ui/Value.svelte";
  import KeyValuePairInfo from "$lib/components/ui/KeyValuePairInfo.svelte";
  import { sanitize } from "$lib/utils/html.utils";
  import DisburseNnsNeuronModal from "$lib/modals/neurons/DisburseNnsNeuronModal.svelte";
  import { STAKE_MATURITY } from "$lib/constants/environment.constants";

  export let neuron: NeuronInfo;

  let isControlledByUser: boolean;
  $: isControlledByUser = isNeuronControllableByUser({
    neuron,
    mainAccount: $accountsStore.main,
  });
  let isControllable: boolean;
  $: isControllable = isNeuronControllable({
    neuron,
    identity: $authStore.identity,
    accounts: $accountsStore,
  });
  let hotkeyControlled: boolean;
  $: hotkeyControlled = isHotKeyControllable({
    neuron,
    identity: $authStore.identity,
  });

  // Note about replacePlaceholders and $st4kedMaturity
  // TODO: placeholders cannot contain ath the moment other placeholders keys - e.g. $stakedMaturity contains $stake would lead to replace errors therefore a distinctive selector $st4kedMaturity
</script>

<NeuronCard {neuron} cardType="info">
  <section>
    <div>
      <p>
        <Value>{secondsToDate(Number(neuron.createdTimestampSeconds))}</Value>
        - {$i18n.neurons.staked}
      </p>
    </div>

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
            {@html sanitize(
              replacePlaceholders(
                STAKE_MATURITY
                  ? $i18n.neuron_detail.voting_power_tooltip_with_stake
                  : $i18n.neuron_detail.voting_power_tooltip_without_stake,
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
              )
            )}
          {/if}
        </svelte:fragment>
      </KeyValuePairInfo>
    {/if}

    <div class="buttons">
      {#if isControllable}
        <IncreaseDissolveDelayButton {neuron} />
        {#if neuron.state === NeuronState.Dissolved}
          <DisburseButton {neuron} modal={DisburseNnsNeuronModal} />
        {:else if neuron.state === NeuronState.Dissolving || neuron.state === NeuronState.Locked}
          <DissolveActionButton
            neuronState={neuron.state}
            neuronId={neuron.neuronId}
          />
        {/if}
      {/if}
    </div>
    <div class="buttons">
      {#if isControllable || hotkeyControlled}
        <IncreaseStakeButton {neuron} />
      {/if}
      {#if isControlledByUser}
        <SplitNeuronButton {neuron} />
      {/if}
    </div>
  </section>
</NeuronCard>

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
