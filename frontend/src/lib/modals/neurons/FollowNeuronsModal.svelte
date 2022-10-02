<script lang="ts">
	import type { NeuronInfo } from '@dfinity/nns';
	import EditFollowNeurons from '../../components/neurons/EditFollowNeurons.svelte';
	import { i18n } from '../../stores/i18n';
	import LegacyModal from '../LegacyModal.svelte';

	export let neuron: NeuronInfo;
</script>

<LegacyModal size="big" on:nnsClose>
	<span slot="title">{$i18n.neurons.follow_neurons_screen}</span>
	<section>
		<EditFollowNeurons {neuron} />
	</section>
</LegacyModal>

<style lang="scss">
	@use '../../themes/mixins/modal';

	section {
		@include modal.section;
	}
</style>
