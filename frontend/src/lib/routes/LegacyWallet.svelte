<script lang="ts">
	import { onMount } from 'svelte';
	import { OWN_CANISTER_ID } from '../constants/canister-ids.constants';
	import { ENABLE_SNS } from '../constants/environment.constants';
	import { AppPath } from '../constants/routes.constants';
	import NnsWallet from '../pages/NnsWallet.svelte';
	import { routeStore } from '../stores/route.store';
	import { isRoutePath } from '../utils/app-path.utils';

	// TODO: Clean after enabling sns https://dfinity.atlassian.net/browse/GIX-1013
	onMount(() => {
		if (
			ENABLE_SNS &&
			isRoutePath({
				paths: [AppPath.LegacyWallet],
				routePath: $routeStore.path
			})
		) {
			routeStore.changeContext(OWN_CANISTER_ID.toText());
		}
	});
</script>

<NnsWallet />
