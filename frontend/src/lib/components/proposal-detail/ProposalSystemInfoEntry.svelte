<script lang="ts">
  import KeyValuePairInfo from "../ui/KeyValuePairInfo.svelte";
  import { sanitize } from "../../utils/html.utils";
  import { i18n } from "../../stores/i18n";

  export let labelKey: string;
  export let testId: string;
  export let value: string;
  export let description: string | undefined;
</script>

<KeyValuePairInfo>
  <svelte:fragment slot="key">{$i18n.proposal_detail[labelKey]}</svelte:fragment
  >
  <span class="value" slot="value" data-tid={`${testId}-value`}>{value}</span>
  <p slot="info" data-tid={`${testId}-description`} class="description">
    {@html sanitize(description ?? $i18n.proposal_detail.no_more_info)}
  </p>
</KeyValuePairInfo>
