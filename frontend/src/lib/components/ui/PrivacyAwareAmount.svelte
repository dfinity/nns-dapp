<script lang="ts">
  import { isBalancePrivacyOptionStore } from "$lib/derived/balance-privacy-active.derived";
  import { renderPrivacyModeBalance } from "$lib/utils/format.utils";

  type Props = {
    value: string;
    length: number;
  };

  const { value, length }: Props = $props();

  const renderedValue = $derived(
    $isBalancePrivacyOptionStore ? renderPrivacyModeBalance(length) : value
  );
</script>

{renderedValue}
