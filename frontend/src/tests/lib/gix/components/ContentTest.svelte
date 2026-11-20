<script lang="ts">
  import Content from "$lib/gix/components/Content.svelte";
</script>

<Content>
  <div data-tid="content-test-slot"></div>
  {#snippet title()}<div data-tid="content-test-title-slot"></div>{/snippet}
  {#snippet toolbarEnd()}<div data-tid="content-test-toolbar-end-slot"
    ></div>{/snippet}
</Content>
