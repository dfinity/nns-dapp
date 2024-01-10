<script lang="ts">
  import { Toggle } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { jsonRepresentationStore } from "$lib/stores/json-representation.store";
  import { jsonRepresentationModeStore } from "$lib/derived/json-representation.derived.js";

  let checked: boolean;
  $: checked = $jsonRepresentationModeStore === "raw";

  const setTree = () => jsonRepresentationStore.setMode("tree");
  const setRaw = () => jsonRepresentationStore.setMode("raw");
  const toggle = () =>
    $jsonRepresentationModeStore === "tree" ? setRaw() : setTree();
</script>

<div
  class="data-representation-toggle"
  data-tid="json-representation-mode-toggle-component"
>
  <button class="ghost" type="button" on:click={setTree} data-tid="toggle-tree"
    >{$i18n.proposal_detail.toggle_tree}</button
  >
  <Toggle
    bind:checked
    on:nnsToggle={toggle}
    ariaLabel={$i18n.proposal_detail.toggle_lable}
  />
  <button class="ghost" type="button" on:click={setRaw} data-tid="toggle-tree"
    >{$i18n.proposal_detail.toggle_raw}</button
  >
</div>

<style lang="scss">
  .data-representation-toggle {
    display: flex;
    align-items: center;
    grid-template-columns: repeat(3, auto);
    grid-column-gap: 2px;

    font-size: var(--font-size-h4);
    line-height: var(--line-height-h4);

    padding: 0 var(--padding-0_5x);
    gap: var(--padding);

    :global(svg) {
      width: var(--padding-2x);
      height: var(--padding-2x);

      &:first-of-type {
        margin-right: calc(var(--padding-0_5x) / 2);
      }
    }
  }
</style>
