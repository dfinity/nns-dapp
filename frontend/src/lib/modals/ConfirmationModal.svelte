<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { i18n } from '../stores/i18n';
	import { Modal } from '@dfinity/gix-components';
	import { busy } from '../stores/busy.store';

	const dispatch = createEventDispatcher();
</script>

<Modal role="alert" on:nnsClose>
	<article>
		<slot />
	</article>

	<svelte:fragment slot="footer">
		<button
			data-tid="confirm-no"
			disabled={$busy}
			on:click={() => dispatch('nnsClose')}
			class="secondary">{$i18n.core.confirm_no}</button
		>
		<button
			data-tid="confirm-yes"
			disabled={$busy}
			class="primary"
			on:click={() => dispatch('nnsConfirm')}>{$i18n.core.confirm_yes}</button
		>
	</svelte:fragment>
</Modal>

<style lang="scss">
	article {
		padding: 0 var(--padding);
	}
</style>
