import { get } from 'svelte/store';
import { accountsListStore } from '../../../lib/derived/accounts-list.derived';
import { accountsStore } from '../../../lib/stores/accounts.store';

describe('accounts', () => {
	it('should return empty array if main is not set', () => {
		accountsStore.reset();
		const value = get(accountsListStore);
		expect(value.length).toBe(0);
	});
});
