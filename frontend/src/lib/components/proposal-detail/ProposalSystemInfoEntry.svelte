<script lang="ts">
  import KeyValuePairInfo from "../ui/KeyValuePairInfo.svelte";
  import { sanitize } from "$lib/utils/html.utils";
  import { i18n } from "$lib/stores/i18n";
  import { keyOf } from "$lib/utils/utils";

  export let labelKey: string;
  export let testId: string;
  export let value: string;
  export let description: string | undefined;
</script>

<KeyValuePairInfo {testId}>
  <svelte:fragment slot="key"
    >{keyOf({ obj: $i18n.proposal_detail, key: labelKey })}</svelte:fragment
  >
  <span class="value" slot="value" data-tid={`${testId}-value`}>{value}</span>

  <svelte:fragment slot="info">
    {@html sanitize(description ?? $i18n.proposal_detail.no_more_info)}
  </svelte:fragment>
</KeyValuePairInfo>
