<script lang="ts">
  import { NeuronState } from "@dfinity/nns";
  import type { NeuronInfo } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import { secondsToDate } from "../../utils/date.utils";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import { formatToken } from "../../utils/icp.utils";
  import NeuronCard from "../neurons/NeuronCard.svelte";
  import IncreaseDissolveDelayButton from "./actions/IncreaseDissolveDelayButton.svelte";
  import IncreaseStakeButton from "./actions/IncreaseStakeButton.svelte";
  import SplitNeuronButton from "./actions/SplitNeuronButton.svelte";
  import DissolveActionButton from "./actions/DissolveActionButton.svelte";
  import DisburseButton from "./actions/DisburseButton.svelte";
  import { authStore } from "../../stores/auth.store";
  import {
    ageMultiplier,
    dissolveDelayMultiplier,
    formatVotingPower,
    isHotKeyControllable,
    isNeuronControllable,
    isNeuronControllableByUser,
    formattedStakedMaturity,
  } from "../../utils/neuron.utils";
  import { accountsStore } from "../../stores/accounts.store";
  import Value from "../ui/Value.svelte";
  import KeyValuePairInfo from "../ui/KeyValuePairInfo.svelte";
  import { sanitize } from "../../utils/html.utils";

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
              replacePlaceholders($i18n.neuron_detail.voting_power_tooltip, {
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
              })
            )}
          {/if}
        </svelte:fragment>
      </KeyValuePairInfo>
    {/if}

    <div class="buttons">
      {#if isControllable}
        <IncreaseDissolveDelayButton {neuron} />
        {#if neuron.state === NeuronState.Dissolved}
          <DisburseButton {neuron} />
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
