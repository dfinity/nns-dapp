<script lang="ts">
	import type { TokenAmount } from '@dfinity/nns';
	import { i18n } from '../../stores/i18n';
	import { replacePlaceholders } from '../../utils/i18n.utils';
	import { formatToken } from '../../utils/icp.utils';
	import AmountDisplay from '../ic/AmountDisplay.svelte';
	import Tooltip from '../ui/Tooltip.svelte';

	export let balance: TokenAmount | undefined;

	let totalTokens: string;
	totalTokens =
		balance !== undefined
			? formatToken({
					value: balance.toE8s(),
					detailed: true
			  })
			: '';
</script>

<div class="title">
	<h1 data-tid="accounts-title">{$i18n.accounts.total}</h1>

	{#if balance !== undefined}
		<Tooltip
			id="wallet-total-icp"
			text={replacePlaceholders($i18n.accounts.current_balance_total, {
				$amount: totalTokens
			})}
		>
			<AmountDisplay amount={balance} />
		</Tooltip>
	{/if}
</div>

<style lang="scss">
	@use '@dfinity/gix-components/styles/mixins/media';

	.title {
		display: block;
		width: 100%;

		margin-bottom: var(--padding-2x);

		--token-font-size: var(--font-size-h1);

		// Minimum height of ICP value + ICP label (ICP component)
		min-height: calc(var(--line-height-standard) * (var(--token-font-size) + 1rem));

		@include media.min-width(medium) {
			display: inline-flex;
			justify-content: space-between;
			align-items: baseline;
		}
	}
</style>
