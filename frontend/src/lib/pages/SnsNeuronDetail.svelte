<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import type { SnsNeuron } from '@dfinity/sns';
	import SnsNeuronHotkeysCard from '../components/sns-neuron-detail/SnsNeuronHotkeysCard.svelte';
	import SnsNeuronMetaInfoCard from '../components/sns-neuron-detail/SnsNeuronMetaInfoCard.svelte';
	import { AppPath } from '../constants/routes.constants';
	import { getSnsNeuron } from '../services/sns-neurons.services';
	import { layoutBackStore } from '../stores/layout.store';
	import { routeStore } from '../stores/route.store';
	import { isRoutePath } from '../utils/app-path.utils';
	import {
		routePathSnsNeuronRootCanisterId,
		routePathSnsNeuronId
	} from '../utils/sns-neuron.utils';
	import {
		type SelectedSnsNeuronContext,
		type SelectedSnsNeuronStore,
		SELECTED_SNS_NEURON_CONTEXT_KEY
	} from '../types/sns-neuron-detail.context';
	import { writable } from 'svelte/store';
	import { setContext } from 'svelte';
	import { toastsError } from '../stores/toasts.store';
	import SkeletonCard from '../components/ui/SkeletonCard.svelte';
	import { neuronsPathStore } from '../derived/paths.derived';

	const loadNeuron = async ({ forceFetch }: { forceFetch: boolean } = { forceFetch: false }) => {
		const { selected } = $selectedSnsNeuronStore;
		if (selected !== undefined) {
			await getSnsNeuron({
				forceFetch,
				rootCanisterId: selected.rootCanisterId,
				neuronIdHex: selected.neuronIdHex,
				onLoad: ({ neuron: snsNeuron }: { neuron: SnsNeuron }) => {
					selectedSnsNeuronStore.update((store) => ({
						...store,
						neuron: snsNeuron
					}));
				},
				onError: () => {
					selectedSnsNeuronStore.update((store) => ({
						...store,
						neuron: undefined
					}));
				}
			});
		}
	};

	const selectedSnsNeuronStore = writable<SelectedSnsNeuronStore>({
		selected: undefined,
		neuron: undefined
	});

	setContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY, {
		store: selectedSnsNeuronStore,
		reload: loadNeuron
	});

	const unsubscribe = routeStore.subscribe(async ({ path }) => {
		if (!isRoutePath({ paths: [AppPath.NeuronDetail], routePath: path })) {
			return;
		}
		const rootCanisterIdMaybe = routePathSnsNeuronRootCanisterId(path);
		const neuronIdMaybe = routePathSnsNeuronId(path);
		if (neuronIdMaybe === undefined || rootCanisterIdMaybe === undefined) {
			unsubscribe();
			routeStore.replace({ path: AppPath.LegacyNeurons });
			return;
		}
		let rootCanisterId: Principal | undefined;
		try {
			rootCanisterId = Principal.fromText(rootCanisterIdMaybe);
		} catch (error) {
			toastsError({
				labelKey: 'error__sns.invalid_root_canister_id',
				substitutions: {
					$canisterId: rootCanisterIdMaybe
				}
			});
			routeStore.replace({ path: AppPath.LegacyNeurons });
			return;
		}

		// `loadNeuron` relies on neuronId and rootCanisterId to be set in the store
		selectedSnsNeuronStore.set({
			selected: {
				neuronIdHex: neuronIdMaybe,
				rootCanisterId
			},
			neuron: null
		});
		loadNeuron();
	});

	const goBack = () =>
		routeStore.navigate({
			path: $neuronsPathStore
		});

	layoutBackStore.set(goBack);

	$: {
		if ($selectedSnsNeuronStore.neuron === undefined) {
			toastsError({
				labelKey: 'error.neuron_not_found'
			});
			// Reset selected project
			routeStore.replace({ path: AppPath.LegacyNeurons });
		}
	}

	let loading: boolean;
	$: loading = $selectedSnsNeuronStore.neuron === null;
</script>

<main>
	<section data-tid="sns-neuron-detail-page">
		{#if loading}
			<SkeletonCard size="large" cardType="info" />
			<SkeletonCard cardType="info" />
		{:else}
			<SnsNeuronMetaInfoCard />
			<SnsNeuronHotkeysCard />
		{/if}
	</section>
</main>
