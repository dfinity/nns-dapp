import { derived, type Readable } from 'svelte/store';
import { snsAccountsStore } from '../../stores/sns-accounts.store';
import type { Account } from '../../types/account';
import { snsProjectSelectedStore } from '../selected-project.derived';

/**
 * Main account is put in the first position. The rest of the accounts keep the same order.
 *
 * @param accounts: Array of accounts
 * @returns accounts
 */
const sortAccounts = (accounts: Account[]): Account[] => {
	const nonMainAccounts: Account[] = accounts.filter(({ type }) => type !== 'main');
	const mainAccount = accounts.find((account) => account.type === 'main');
	return [...(mainAccount ? [mainAccount] : []), ...nonMainAccounts];
};

export const snsProjectAccountsStore: Readable<Account[] | undefined> = derived(
	[snsAccountsStore, snsProjectSelectedStore],
	([store, selectedSnsRootCanisterId]) => {
		const projectStore = store[selectedSnsRootCanisterId.toText()];
		return projectStore === undefined ? undefined : sortAccounts(projectStore.accounts);
	}
);
