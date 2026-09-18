<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { observeRenderedMarkdown } from "$lib/utils/html.utils";
  import { Html, KeyValuePairInfo } from "@dfinity/gix-components";
  import { isNullish } from "@dfinity/utils";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  type Props = {
    label: string;
    testId: string;
    value: string;
    description: string | undefined;
  };

  let { label, testId, value: valueInfo, description }: Props = $props();

  // An SNS supplies the description of its topics and of its nervous system
  // functions, so keep only the tags and the attributes that a description
  // needs.
  let container = $state<HTMLDivElement | undefined>(undefined);

  $effect(() => {
    const element = container;

    if (isNullish(element)) {
      return;
    }

    return observeRenderedMarkdown(element);
  });
</script>

<KeyValuePairInfo {testId} alignIconRight>
  {#snippet key()}
    <span class="description">{label}</span>{/snippet}
  {#snippet value()}<span class="value" data-tid={`${testId}-value`}
      >{valueInfo}</span
    >{/snippet}

  {#snippet info()}
    <TestIdWrapper testId="info">
      <!-- TestIdWrapper is a `display: contents` element too, but it exposes no
      element to bind to, so the sanitizer needs this one. -->
      <div class="contents" bind:this={container}>
        <Html text={description ?? $i18n.proposal_detail.no_more_info} />
      </div>
    </TestIdWrapper>
  {/snippet}
</KeyValuePairInfo>

<style lang="scss">
  .contents {
    display: contents;
  }
</style>
