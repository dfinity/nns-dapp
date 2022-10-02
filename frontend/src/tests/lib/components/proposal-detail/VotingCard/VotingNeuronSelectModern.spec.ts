/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/svelte';
import VotingNeuronSelectModern from '../../../../../lib/components/proposal-detail/VotingCard/VotingNeuronSelectModern.svelte';
import { votingNeuronSelectStore } from '../../../../../lib/stores/proposals.store';
import en from '../../../../mocks/i18n.mock';
import { mockNeuron } from '../../../../mocks/neurons.mock';
import { mockProposalInfo } from '../../../../mocks/proposal.mock';

describe('VotingNeuronSelectModern', () => {
	describe('No selectable neurons', () => {
		it('should display no neurons information', () => {
			const { getByTestId } = render(VotingNeuronSelectModern, {
				props: {
					proposalInfo: mockProposalInfo,
					disabled: false,
					totalNeuronsVotingPower: BigInt(1)
				}
			});

			expect(getByTestId('voting-collapsible-toolbar-neurons')?.textContent?.trim()).toEqual(
				en.proposal_detail__vote.neurons
			);
			expect(() => getByTestId('voting-collapsible-toolbar-voting-power')).toThrow();
		});
	});

	describe('Has selected neurons', () => {
		const neuronIds = [0, 1, 2].map(BigInt);
		const neurons = neuronIds.map((neuronId) => ({ ...mockNeuron, neuronId }));

		beforeAll(() => votingNeuronSelectStore.set(neurons));

		it('should display voting power', () => {
			const { getByTestId } = render(VotingNeuronSelectModern, {
				props: {
					proposalInfo: mockProposalInfo,
					disabled: false,
					totalNeuronsVotingPower: BigInt(1)
				}
			});

			expect(getByTestId('voting-collapsible-toolbar-voting-power')).not.toBeNull();
		});

		it('should display selectable neurons for voting power', () => {
			const { getByTestId } = render(VotingNeuronSelectModern, {
				props: {
					proposalInfo: mockProposalInfo,
					disabled: false,
					totalNeuronsVotingPower: BigInt(1)
				}
			});

			expect(
				getByTestId('voting-collapsible-toolbar-neurons')
					?.textContent?.trim()
					.includes(`(${neurons.length}/${neurons.length})`)
			).toBeTruthy();
		});
	});
});
