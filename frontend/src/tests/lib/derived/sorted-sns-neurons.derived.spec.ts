/**
 * @jest-environment jsdom
 */
import { Principal } from '@dfinity/principal';
import type { SnsNeuron } from '@dfinity/sns';
import { tick } from 'svelte';
import { get } from 'svelte/store';
import { CONTEXT_PATH } from '../../../lib/constants/routes.constants';
import { sortedSnsNeuronStore } from '../../../lib/derived/sorted-sns-neurons.derived';
import { routeStore } from '../../../lib/stores/route.store';
import { snsNeuronsStore } from '../../../lib/stores/sns-neurons.store';
import { mockPrincipal } from '../../mocks/auth.store.mock';
import { createMockSnsNeuron } from '../../mocks/sns-neurons.mock';

describe('sortedSnsNeuronStore', () => {
	afterEach(() => snsNeuronsStore.reset());
	it('returns an empty array if no neurons', () => {
		expect(get(sortedSnsNeuronStore).length).toBe(0);
	});

	it('should sort neurons by createdTimestampSeconds', async () => {
		const neurons: SnsNeuron[] = [
			{
				...createMockSnsNeuron({
					stake: BigInt(1_000_000_000),
					id: [1, 5, 3, 9, 1, 1, 1]
				}),
				created_timestamp_seconds: BigInt(1)
			},
			{
				...createMockSnsNeuron({
					stake: BigInt(2_000_000_000),
					id: [1, 5, 3, 9, 9, 3, 2]
				}),
				created_timestamp_seconds: BigInt(3)
			},
			{
				...createMockSnsNeuron({
					stake: BigInt(10_000_000_000),
					id: [1, 2, 2, 9, 9, 3, 2]
				}),
				created_timestamp_seconds: BigInt(2)
			}
		];
		snsNeuronsStore.setNeurons({
			rootCanisterId: mockPrincipal,
			neurons,
			certified: true
		});
		routeStore.update({
			path: `${CONTEXT_PATH}/${mockPrincipal.toText()}/neurons`
		});

		await tick();
		expect(get(sortedSnsNeuronStore)).toEqual([neurons[1], neurons[2], neurons[0]]);
	});

	it('should return the sorted neurons of the selected project', async () => {
		const neurons1: SnsNeuron[] = [
			{
				...createMockSnsNeuron({
					stake: BigInt(1_000_000_000),
					id: [1, 5, 3, 9, 1, 1, 1]
				}),
				created_timestamp_seconds: BigInt(1)
			},
			{
				...createMockSnsNeuron({
					stake: BigInt(2_000_000_000),
					id: [1, 5, 3, 9, 9, 3, 2]
				}),
				created_timestamp_seconds: BigInt(3)
			},
			{
				...createMockSnsNeuron({
					stake: BigInt(10_000_000_000),
					id: [1, 2, 2, 9, 9, 3, 2]
				}),
				created_timestamp_seconds: BigInt(2)
			}
		];
		snsNeuronsStore.setNeurons({
			rootCanisterId: mockPrincipal,
			neurons: neurons1,
			certified: true
		});
		const neurons2: SnsNeuron[] = [
			{
				...createMockSnsNeuron({
					stake: BigInt(1_000_000_000),
					id: [1, 5, 3, 9, 1, 1, 1]
				}),
				created_timestamp_seconds: BigInt(2)
			},
			{
				...createMockSnsNeuron({
					stake: BigInt(2_000_000_000),
					id: [1, 5, 3, 9, 9, 3, 2]
				}),
				created_timestamp_seconds: BigInt(1)
			},
			{
				...createMockSnsNeuron({
					stake: BigInt(10_000_000_000),
					id: [1, 2, 2, 9, 9, 3, 2]
				}),
				created_timestamp_seconds: BigInt(3)
			}
		];
		const principal2 = Principal.fromText('aaaaa-aa');
		snsNeuronsStore.setNeurons({
			rootCanisterId: principal2,
			neurons: neurons2,
			certified: true
		});
		routeStore.update({
			path: `${CONTEXT_PATH}/${mockPrincipal.toText()}/neurons`
		});
		await tick();
		expect(get(sortedSnsNeuronStore)).toEqual([neurons1[1], neurons1[2], neurons1[0]]);

		routeStore.update({
			path: `${CONTEXT_PATH}/${principal2.toText()}/neurons`
		});
		routeStore.update({ path: `${CONTEXT_PATH}/aaaaa-aa/neurons` });
		await tick();
		expect(get(sortedSnsNeuronStore)).toEqual([neurons2[2], neurons2[0], neurons2[1]]);
	});
});
