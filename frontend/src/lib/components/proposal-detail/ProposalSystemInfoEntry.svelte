<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Html, KeyValuePairInfo } from "@dfinity/gix-components";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  interface Props {
    label: string;
    testId: string;
    value: string;
    description: string | undefined;
  }

  let { label, testId, value: valueInfo, description }: Props = $props();
</script>

<KeyValuePairInfo {testId} alignIconRight>
  {#snippet key()}
    <span class="description">{label}</span>{/snippet}
  {#snippet value()}<span class="value" data-tid={`${testId}-value`}
      >{valueInfo}</span
    >{/snippet}

  {#snippet info()}
    <TestIdWrapper testId="info">
      <Html text={description ?? $i18n.proposal_detail.no_more_info} />
    </TestIdWrapper>
  {/snippet}
</KeyValuePairInfo>
