<script lang="ts">
	import { Card } from '@dfinity/gix-components';
	import { type ProposalInfo, type NeuronId, type ProposalId, ProposalStatus } from '@dfinity/nns';
	import { i18n } from '../../stores/i18n';
	import { routeStore } from '../../stores/route.store';
	import { AppPath } from '../../constants/routes.constants';
	import { mapProposalInfo } from '../../utils/proposals.utils';
	import ProposalMeta from './ProposalMeta.svelte';
	import type { Color } from '../../types/theme';
	import Tag from '../ui/Tag.svelte';

	export let proposalInfo: ProposalInfo;
	export let hidden: boolean = false;
	// TODO(L2-965): delete property and use modern
	export let layout: 'modern' | 'legacy' = 'legacy';
	import Value from '../ui/Value.svelte';
	import ProposalCountdown from './ProposalCountdown.svelte';

	let status: ProposalStatus = ProposalStatus.Unknown;
	let id: ProposalId | undefined;
	let title: string | undefined;
	let color: Color | undefined;

	let topic: string | undefined;
	let proposer: NeuronId | undefined;
	let type: string | undefined;

	$: ({ status, id, title, color, topic, proposer, type } = mapProposalInfo(proposalInfo));

	const showProposal = () => {
		routeStore.navigate({
			path: `${AppPath.ProposalDetail}/${id}`
		});
	};
</script>

<li class:hidden>
	{#if layout === 'legacy'}
		<Card role="link" on:click={showProposal} testId="proposal-card">
			<div slot="start" class="title-container">
				<p class="title" {title}>{title}</p>
			</div>
			<Tag slot="end" {color}>{$i18n.status[ProposalStatus[status]] ?? ''}</Tag>

			<ProposalMeta {proposalInfo} showTopic />
		</Card>
	{:else}
		<Card role="link" on:click={showProposal} testId="proposal-card" withArrow={true}>
			<div class="card-meta id">
				<Value ariaLabel={$i18n.proposal_detail.id_prefix}>{id}</Value>
			</div>

			<div class="card-meta">
				<span>{$i18n.proposal_detail.type_prefix}</span>
				<Value ariaLabel={$i18n.proposal_detail.type_prefix}>{type}</Value>
			</div>

			<div class="card-meta">
				<span>{$i18n.proposal_detail.topic_prefix}</span>
				<Value>{topic ?? ''}</Value>
			</div>

			{#if proposer !== undefined}
				<div class="card-meta">
					<span>{$i18n.proposal_detail.proposer_prefix}</span>
					<Value>{proposer}</Value>
				</div>
			{/if}

			<blockquote class="title-placeholder">
				<p class="description">{title}</p>
			</blockquote>

			<div class="card-meta">
				<p class={`${color ?? ''} status`}>
					{$i18n.status[ProposalStatus[status]] ?? ''}
				</p>

				<ProposalCountdown {proposalInfo} />
			</div>
		</Card>
	{/if}
</li>

<style lang="scss">
	@use '@dfinity/gix-components/styles/mixins/text';
	@use '@dfinity/gix-components/styles/mixins/card';
	@use '@dfinity/gix-components/styles/mixins/media';

	li.hidden {
		visibility: hidden;
	}

	.title-container {
		@include card.stacked-title;
	}

	.title {
		@include text.clamp(3);

		@include media.min-width(small) {
			margin: 0 var(--padding-2x) 0 0;
		}

		color: var(--value-color);
	}

	.card-meta {
		@include card.meta;

		&.id {
			justify-content: flex-end;

			:global(.value) {
				color: var(--primary);
			}
		}
	}

	.title-placeholder {
		flex-grow: 1;

		p {
			@include text.clamp(6);
			word-break: break-word;
		}
	}

	/**
   * TODO: cleanup once legacy removed, status (L2-954) and counter (L2-955)
   */
	.status {
		// Default color: Color.PRIMARY
		--badge-color: var(--primary);
		color: var(--badge-color);

		margin-bottom: 0;

		// Color.WARNING
		&.warning {
			--badge-color: var(--warning-emphasis);
		}

		// Color.SUCCESS
		&.success {
			--badge-color: var(--positive-emphasis);
		}

		// Color.ERROR
		&.error {
			--badge-color: var(--negative-emphasis-light);
		}
	}
</style>
