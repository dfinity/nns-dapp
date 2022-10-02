/**
 * @jest-environment jsdom
 */

import { render, waitFor } from '@testing-library/svelte';
import type { Subscriber } from 'svelte/store';
import { CONTEXT_PATH } from '../../../lib/constants/routes.constants';
import { snsProjectAccountsStore } from '../../../lib/derived/sns/sns-project-accounts.derived';
import SnsAccounts from '../../../lib/pages/SnsAccounts.svelte';
import { loadSnsAccounts } from '../../../lib/services/sns-accounts.services';
import { routeStore } from '../../../lib/stores/route.store';
import { mockPrincipal } from '../../mocks/auth.store.mock';
import en from '../../mocks/i18n.mock';
import { mockSnsAccountsStoreSubscribe } from '../../mocks/sns-accounts.mock';

jest.mock('../../../lib/services/sns-accounts.services', () => {
	return {
		loadSnsAccounts: jest.fn().mockResolvedValue(undefined)
	};
});

describe('SnsAccounts', () => {
	describe('when there are accounts in the store', () => {
		beforeEach(() => {
			jest
				.spyOn(snsProjectAccountsStore, 'subscribe')
				.mockImplementation(mockSnsAccountsStoreSubscribe());
			// Context needs to match the mocked sns accounts
			routeStore.update({
				path: `${CONTEXT_PATH}/${mockPrincipal.toText()}/accounts`
			});
		});

		it('should render accounts title', () => {
			const { getByTestId } = render(SnsAccounts);

			expect(getByTestId('accounts-title')).toBeInTheDocument();
		});

		it('should contain a tooltip', () => {
			const { container } = render(SnsAccounts);

			expect(container.querySelector('.tooltip-wrapper')).toBeInTheDocument();
		});

		it('should render a main Account', async () => {
			const { getByText } = render(SnsAccounts);

			await waitFor(() => expect(getByText(en.accounts.main)).toBeInTheDocument());
		});

		it('should render account cards', async () => {
			const { getAllByTestId } = render(SnsAccounts);

			await waitFor(() => expect(getAllByTestId('account-card').length).toBeGreaterThan(0));
		});

		it('should load sns accounts of the project', () => {
			render(SnsAccounts);

			expect(loadSnsAccounts).toHaveBeenCalledWith(mockPrincipal);
		});
	});

	describe('when no accounts', () => {
		beforeEach(() => {
			jest
				.spyOn(snsProjectAccountsStore, 'subscribe')
				.mockImplementation((run: Subscriber<undefined>): (() => void) => {
					run(undefined);
					return () => undefined;
				});
		});
		it('should not render a token amount component nor zero', () => {
			const { container } = render(SnsAccounts);

			// Tooltip wraps the amount
			expect(container.querySelector('.tooltip-wrapper')).not.toBeInTheDocument();
		});
	});
});
