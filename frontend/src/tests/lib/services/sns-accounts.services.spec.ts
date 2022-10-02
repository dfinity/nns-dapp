import { tick } from 'svelte';
import { get } from 'svelte/store';
import * as api from '../../../lib/api/sns-ledger.api';
import * as services from '../../../lib/services/sns-accounts.services';
import { snsAccountsStore } from '../../../lib/stores/sns-accounts.store';
import { mockPrincipal } from '../../mocks/auth.store.mock';
import { mockSnsMainAccount } from '../../mocks/sns-accounts.mock';

const { loadSnsAccounts } = services;

describe('sns-accounts-services', () => {
	describe('loadSnsAccounts', () => {
		beforeEach(() => {
			jest.clearAllMocks();
			snsAccountsStore.reset();
			jest.spyOn(console, 'error').mockImplementation(() => undefined);
		});
		it('should call api.getSnsAccounts and load neurons in store', async () => {
			const spyQuery = jest
				.spyOn(api, 'getSnsAccounts')
				.mockImplementation(() => Promise.resolve([mockSnsMainAccount]));

			await loadSnsAccounts(mockPrincipal);

			await tick();
			const store = get(snsAccountsStore);
			expect(store[mockPrincipal.toText()]?.accounts).toHaveLength(1);
			expect(spyQuery).toBeCalled();
		});

		it('should empty store if update call fails', async () => {
			snsAccountsStore.setAccounts({
				rootCanisterId: mockPrincipal,
				accounts: [mockSnsMainAccount],
				certified: true
			});
			const spyQuery = jest
				.spyOn(api, 'getSnsAccounts')
				.mockImplementation(() => Promise.reject(undefined));

			await loadSnsAccounts(mockPrincipal);

			await tick();
			const store = get(snsAccountsStore);
			expect(store[mockPrincipal.toText()]).toBeUndefined();
			expect(spyQuery).toBeCalled();
		});
	});
});
