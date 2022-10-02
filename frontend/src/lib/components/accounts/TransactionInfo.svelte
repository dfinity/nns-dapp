<script lang="ts">
	import { i18n } from '../../stores/i18n';
	import { mainTransactionFeeStore } from '../../stores/transaction-fees.store';
	import { formattedTransactionFeeICP } from '../../utils/icp.utils';
	import Value from '../ui/Value.svelte';

	export let feeOnly: boolean = false;
	export let source: string;
	export let destination: string;
	export let hardwareWallet: boolean = false;
</script>

{#if !feeOnly}
	<p class="label">
		{$i18n.accounts.source}{hardwareWallet ? ` – ${$i18n.accounts.hardware_wallet_text}` : ''}
	</p>
	<p class="value">{source}</p>

	<p class="label">{$i18n.accounts.destination}</p>
	<p class="value">{destination}</p>
{/if}

<p class="label">{$i18n.accounts.transaction_fee}</p>

<p class="fee">
	<Value>{formattedTransactionFeeICP($mainTransactionFeeStore)}</Value>
	{$i18n.core.icp}
</p>

<style lang="scss">
	h5 {
		margin: 0;
	}

	p {
		margin: 0 0 var(--padding-0_5x);
		word-wrap: break-word;
	}

	.fee {
		flex-grow: 1;
	}
</style>
