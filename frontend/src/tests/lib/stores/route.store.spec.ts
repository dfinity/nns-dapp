/**
 * @jest-environment jsdom
 */

import { get } from 'svelte/store';
import { AppPath, CONTEXT_PATH } from '../../../lib/constants/routes.constants';
import { routeStore } from '../../../lib/stores/route.store';
import { getContextFromPath, isContextPath, isRoutePath } from '../../../lib/utils/app-path.utils';

describe('route-store', () => {
	it('should set referrer path', () => {
		routeStore.update({ path: AppPath.LegacyAccounts });

		routeStore.navigate({ path: AppPath.Proposals });

		let referrerPath = get(routeStore).referrerPath;
		expect(referrerPath).toEqual(AppPath.LegacyAccounts);

		routeStore.replace({ path: AppPath.LegacyNeurons });

		referrerPath = get(routeStore).referrerPath;
		expect(referrerPath).toEqual(AppPath.Proposals);
	});

	describe('changeContext', () => {
		beforeEach(() => {
			// TODO: Create a path creator helper
			routeStore.update({ path: `${CONTEXT_PATH}/aaaaa-aa/neuron/12344` });
		});

		it('should change context id correctly', () => {
			routeStore.update({ path: `${CONTEXT_PATH}/aaaaa-aa/neuron/12344` });

			const newContext = 'bbbbb-bb';
			routeStore.changeContext(newContext);

			const state = get(routeStore);
			expect(isContextPath(state.path)).toBe(true);
			expect(getContextFromPath(state.path)).toBe(newContext);
			expect(isRoutePath({ paths: [AppPath.NeuronDetail], routePath: state.path })).toBe(true);
		});

		// it("should ignore if current path does not support context", () => {});
	});
});
