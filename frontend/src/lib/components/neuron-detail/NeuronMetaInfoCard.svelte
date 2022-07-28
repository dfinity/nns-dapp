<script lang="ts">
  import { NeuronState } from "@dfinity/nns";
  import type { NeuronInfo } from "@dfinity/nns";
  import IconInfo from "../../icons/IconInfo.svelte";
  import { i18n } from "../../stores/i18n";
  import { secondsToDate } from "../../utils/date.utils";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import { formatICP } from "../../utils/icp.utils";
  import NeuronCard from "../neurons/NeuronCard.svelte";
  import Tooltip from "../ui/Tooltip.svelte";
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
  } from "../../utils/neuron.utils";
  import { accountsStore } from "../../stores/accounts.store";
  import Value from "../ui/Value.svelte";

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
    <p class="voting-power">
      {#if neuron.votingPower}
        {`${$i18n.neurons.voting_power}:`}
        <span class="amount">
          <Value>{formatVotingPower(neuron.votingPower)}</Value>
        </span>
        {#if neuron.fullNeuron?.cachedNeuronStake !== undefined}
          <Tooltip
            id="voting-power-info"
            text={replacePlaceholders(
              $i18n.neuron_detail.voting_power_tooltip,
              {
                $stake: formatICP({
                  value: neuron.fullNeuron.cachedNeuronStake,
                  detailed: true,
                }),
                $delayMultiplier: dissolveDelayMultiplier(
                  Number(neuron.dissolveDelaySeconds)
                ).toFixed(2),
                $ageMultiplier: ageMultiplier(
                  Number(neuron.ageSeconds)
                ).toFixed(2),
              }
            )}
          >
            <span>
              <IconInfo />
            </span>
          </Tooltip>
        {/if}
      {/if}
    </p>
    <div class="buttons">
      {#if isControllable}
        <IncreaseDissolveDelayButton {neuron} />
        {#if neuron.state === NeuronState.DISSOLVED}
          <DisburseButton {neuron} />
        {:else if neuron.state === NeuronState.DISSOLVING || neuron.state === NeuronState.LOCKED}
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
  @use "../../themes/mixins/media";
  section {
    padding: var(--padding) 0 0 0;
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  .voting-power {
    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);

    span {
      display: flex;
      align-items: center;
    }

    .amount {
      font-weight: bold;
    }
  }

  .buttons {
    display: flex;
    gap: var(--padding);
    align-items: center;
    justify-content: flex-start;
  }
</style>
