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
  import JoinCommunityFundButton from "./actions/JoinCommunityFundButton.svelte";
  import SplitNeuronButton from "./actions/SplitNeuronButton.svelte";
  import DissolveActionButton from "./actions/DissolveActionButton.svelte";
  import DisburseButton from "./actions/DisburseButton.svelte";
  import { authStore } from "../../stores/auth.store";
  import {
    ageMultiplier,
    dissolveDelayMultiplier,
    formatVotingPower,
    hasJoinedCommunityFund,
    isHotKeyControllable,
    isNeuronControllable,
    isNeuronControllableByUser,
  } from "../../utils/neuron.utils";
  import { accountsStore } from "../../stores/accounts.store";

  export let neuron: NeuronInfo;

  let isCommunityFund: boolean;
  $: isCommunityFund = hasJoinedCommunityFund(neuron);
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

<NeuronCard {neuron}>
  <section>
    <div class="space-between">
      <p>
        {secondsToDate(Number(neuron.createdTimestampSeconds))} - {$i18n.neurons
          .staked}
      </p>
      {#if !isCommunityFund && isControlledByUser}
        <JoinCommunityFundButton neuronId={neuron.neuronId} />
      {/if}
    </div>
    <div class="space-between">
      <p class="voting-power">
        {#if neuron.votingPower}
          {`${$i18n.neurons.voting_power}:`}
          <span class="amount">
            {formatVotingPower(neuron.votingPower)}
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
    </div>
    <div class="only-buttons">
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
  .space-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;

    @include media.min-width(small) {
      flex-wrap: nowrap;
    }
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

  .only-buttons {
    display: flex;
    justify-content: end;
    align-items: center;
    gap: var(--padding);

  }

  .buttons {
    display: flex;
    gap: var(--padding);
    flex-grow: 1;
    justify-content: end;
  }
</style>
