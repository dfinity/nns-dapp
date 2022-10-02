<script lang="ts">
	import type { NeuronInfo } from '@dfinity/nns';
	import { createEventDispatcher } from 'svelte';
	import { updateDelay } from '../../services/neurons.services';
	import { i18n } from '../../stores/i18n';
	import { secondsToDuration } from '../../utils/date.utils';
	import { replacePlaceholders } from '../../utils/i18n.utils';
	import { formatToken } from '../../utils/icp.utils';
	import { formatVotingPower, neuronStake, votingPower } from '../../utils/neuron.utils';
	import { busy, stopBusy } from '../../stores/busy.store';
	import { startBusyNeuron } from '../../services/busy.services';
	import FooterModal from '../../modals/FooterModal.svelte';
	import { valueSpan } from '../../utils/utils';

	export let delayInSeconds: number;
	export let neuron: NeuronInfo;
	export let confirmButtonText: string;

	const dispatcher = createEventDispatcher();
	let neuronICP: bigint;
	$: neuronICP = neuronStake(neuron);

	const updateNeuron = async () => {
		startBusyNeuron({ initiator: 'update-delay', neuronId: neuron.neuronId });

		const neuronId = await updateDelay({
			neuronId: neuron.neuronId,
			dissolveDelayInSeconds: delayInSeconds - Number(neuron.dissolveDelaySeconds)
		});

		stopBusy('update-delay');

		if (neuronId !== undefined) {
			dispatcher('nnsUpdated');
		}
	};
</script>

<div class="wizard-wrapper" data-tid="confirm-dissolve-delay-container">
	<div class="main-info">
		<h3>{secondsToDuration(BigInt(delayInSeconds))}</h3>
	</div>
	<div>
		<p class="label">{$i18n.neurons.neuron_id}</p>
		<p class="value">{neuron.neuronId}</p>
	</div>
	<div>
		<p class="label">{$i18n.neurons.neuron_balance}</p>
		<p>
			{@html replacePlaceholders($i18n.neurons.icp_stake, {
				$amount: valueSpan(formatToken({ value: neuronICP, detailed: true }))
			})}
		</p>
	</div>
	<div class="voting-power">
		<p class="label">{$i18n.neurons.voting_power}</p>
		<p class="value">
			{formatVotingPower(
				votingPower({
					stake: neuronICP,
					dissolveDelayInSeconds: delayInSeconds
				})
			)}
		</p>
	</div>
	<FooterModal>
		<button class="secondary" disabled={$busy} on:click={() => dispatcher('nnsBack')}>
			{$i18n.neurons.edit_delay}
		</button>
		<button
			class="primary"
			data-tid="confirm-delay-button"
			disabled={$busy}
			on:click={updateNeuron}
		>
			{confirmButtonText}
		</button>
	</FooterModal>
</div>

<style lang="scss">
	.main-info {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: var(--padding-3x);
	}

	.voting-power {
		flex-grow: 1;
	}
</style>
