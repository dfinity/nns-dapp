<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Html, KeyValuePairInfo } from "@dfinity/gix-components";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  export let label: string;
  export let testId: string;
  export let value: string;
  export let description: string | undefined;
</script>

<KeyValuePairInfo {testId} alignIconRight>
  <span slot="key" class="description">{label}</span>
  <span class="value" slot="value" data-tid={`${testId}-value`}>{value}</span>

  <svelte:fragment slot="info">
    <TestIdWrapper testId="info">
      <Html text={description ?? $i18n.proposal_detail.no_more_info} />
    </TestIdWrapper>
  </svelte:fragment>
</KeyValuePairInfo>
