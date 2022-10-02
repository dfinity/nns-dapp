<script lang="ts">
	import { ICPToken, TokenAmount } from '@dfinity/nns';
	import type { SnsSummary } from '../../types/sns';
	import { getContext } from 'svelte';
	import {
		PROJECT_DETAIL_CONTEXT_KEY,
		type ProjectDetailContext
	} from '../../types/project-detail.context';
	import KeyValuePair from '../ui/KeyValuePair.svelte';
	import AmountDisplay from '../ic/AmountDisplay.svelte';
	import { i18n } from '../../stores/i18n';
	import type { SnsParams } from '@dfinity/sns';
	import DateSeconds from '../ui/DateSeconds.svelte';

	const { store: projectDetailStore } = getContext<ProjectDetailContext>(
		PROJECT_DETAIL_CONTEXT_KEY
	);

	let params: SnsParams;
	// type safety validation is done in ProjectDetail component
	$: ({
		swap: { params }
	} = $projectDetailStore.summary as SnsSummary);

	let minCommitmentIcp: TokenAmount;
	$: minCommitmentIcp = TokenAmount.fromE8s({
		amount: params.min_participant_icp_e8s,
		token: ICPToken
	});
	let maxCommitmentIcp: TokenAmount;
	$: maxCommitmentIcp = TokenAmount.fromE8s({
		amount: params.max_participant_icp_e8s,
		token: ICPToken
	});
</script>

<KeyValuePair>
	<span slot="key">{$i18n.sns_project_detail.min_commitment} </span>
	<AmountDisplay slot="value" amount={minCommitmentIcp} singleLine />
</KeyValuePair>
<KeyValuePair>
	<span slot="key">{$i18n.sns_project_detail.max_commitment} </span>
	<AmountDisplay slot="value" amount={maxCommitmentIcp} singleLine />
</KeyValuePair>
<KeyValuePair>
	<span slot="key">{$i18n.sns_project_detail.sale_end} </span>
	<DateSeconds
		slot="value"
		seconds={Number(params.swap_due_timestamp_seconds ?? BigInt(0))}
		tagName="span"
	/>
</KeyValuePair>
