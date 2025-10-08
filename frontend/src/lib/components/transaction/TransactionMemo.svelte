<script lang="ts">
  import InputWithError from "$lib/components/ui/InputWithError.svelte";
  import { i18n } from "$lib/stores/i18n";

  type Props = {
    memo: string | undefined;
    errorMessage?: string;
  };

  let { memo = $bindable(), errorMessage }: Props = $props();
</script>

<div class="memo">
  <InputWithError
    testId="transaction-memo-input"
    name="memo"
    inputType="text"
    placeholderLabelKey={$i18n.accounts.icp_transaction_memo_label}
    bind:value={memo}
    autocomplete="off"
    {errorMessage}
  >
    <span class="label" slot="label">
      {$i18n.accounts.icp_transaction_memo_label}
    </span>
  </InputWithError>

  <span class="hint">{$i18n.accounts.icp_transaction_memo_hint}</span>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .memo {
    .label {
      display: inline-block;
      margin-top: var(--padding-2x);
      @include fonts.small();
      color: var(--text-description);
    }

    .hint {
      @include fonts.small();
      color: var(--text-description);
    }
  }
</style>
