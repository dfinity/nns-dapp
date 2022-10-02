/**
 * @jest-environment jsdom
 */
import { get } from 'svelte/store';
import { OWN_CANISTER_ID } from '../../../lib/constants/canister-ids.constants';
import { AppPath, CONTEXT_PATH } from '../../../lib/constants/routes.constants';
import {
	accountsPathStore,
	neuronPathStore,
	neuronsPathStore,
	walletPathStore
} from '../../../lib/derived/paths.derived';
import { routeStore } from '../../../lib/stores/route.store';
import { paths } from '../../../lib/utils/app-path.utils';

describe('paths derived stores', () => {
	describe('accountsPathStore', () => {
		beforeEach(() => {
			routeStore.update({ path: AppPath.LegacyAccounts });
		});
		it('should return NNS accounts path as default', () => {
			const $store = get(accountsPathStore);

			expect($store).toBe(paths.accounts(OWN_CANISTER_ID.toText()));
		});

		it('should return SNS accounts path', () => {
			const context = 'aaaaa-aa';
			routeStore.update({ path: `${CONTEXT_PATH}/${context}/neuron/12344` });
			const $store = get(accountsPathStore);

			expect($store).toBe(paths.accounts(context));
		});
	});

	describe('walletPathStore', () => {
		beforeEach(() => {
			routeStore.update({ path: AppPath.LegacyAccounts });
		});
		it('should return NNS accounts path as default', () => {
			const $store = get(walletPathStore);

			expect($store).toBe(paths.wallet(OWN_CANISTER_ID.toText()));
		});

		it('should return SNS accounts path', () => {
			const context = 'aaaaa-aa';
			routeStore.update({ path: `${CONTEXT_PATH}/${context}/neuron/12344` });
			const $store = get(walletPathStore);

			expect($store).toBe(paths.wallet(context));
		});
	});

	describe('neuronsPathStore', () => {
		beforeEach(() => {
			routeStore.update({ path: AppPath.LegacyAccounts });
		});
		it('should return NNS accounts path as default', () => {
			const $store = get(neuronsPathStore);

			expect($store).toBe(paths.neurons(OWN_CANISTER_ID.toText()));
		});

		it('should return SNS accounts path', () => {
			const context = 'aaaaa-aa';
			routeStore.update({ path: `${CONTEXT_PATH}/${context}/neuron/12344` });
			const $store = get(neuronsPathStore);

			expect($store).toBe(paths.neurons(context));
		});
	});

	describe('neuronPathStore', () => {
		beforeEach(() => {
			routeStore.update({ path: AppPath.LegacyAccounts });
		});
		it('should return NNS accounts path as default', () => {
			const $store = get(neuronPathStore);

			expect($store).toBe(paths.neuronDetail(OWN_CANISTER_ID.toText()));
		});

		it('should return SNS accounts path', () => {
			const context = 'aaaaa-aa';
			routeStore.update({ path: `${CONTEXT_PATH}/${context}/neuron/12344` });
			const $store = get(neuronPathStore);

			expect($store).toBe(paths.neuronDetail(context));
		});
	});
});
