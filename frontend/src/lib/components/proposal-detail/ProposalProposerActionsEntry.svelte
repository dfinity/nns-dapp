<script lang="ts">
  import JsonPreview from "$lib/components/common/JsonPreview.svelte";
  import TreeRawToggle from "$lib/components/proposal-detail/JsonRepresentationModeToggle.svelte";
  import Copy from "$lib/components/ui/Copy.svelte";
  import { stringifyJson } from "$lib/utils/utils";

  type Props = {
    actionKey?: string;
    actionData?: unknown;
  };
  const { actionKey, actionData }: Props = $props();

  const copyContent = $derived(stringifyJson(actionData, { indentation: 2 }));
</script>

<div
  class="content-cell-island"
  data-tid="proposal-proposer-actions-entry-component"
>
  <div class="header">
    <div class="title-copy">
      <h2
        class="content-cell-title header-text"
        data-tid="proposal-proposer-actions-entry-title"
      >
        {actionKey ?? ""}
      </h2>
      <Copy value={copyContent} />
    </div>
    <div class="toggle">
      <TreeRawToggle />
    </div>
  </div>

  <div
    class="content-cell-details"
    data-tid="proposal-proposer-actions-entry-fields"
  >
    <JsonPreview json={actionData} />
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";
  @use "@dfinity/gix-components/dist/styles/mixins/text";

  .header-text {
    display: flex;
    align-items: center;
    @include fonts.h3;

    @include text.clamp(1);
  }

  .toggle {
    // compensate toggle and toggle inner buttons padding. Is important when cols wrap on mobile.
    margin: 0 calc(var(--padding-0_5x) * -2);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    flex-wrap: wrap;
    row-gap: var(--padding);

    .title-copy {
      display: flex;
      align-items: center;
    }
  }
</style>
