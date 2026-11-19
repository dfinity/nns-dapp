<script lang="ts">
  import { BottomSheet } from "$lib/gix";

  export let testId: string;
</script>

<BottomSheet>
  {#snippet header()}<p data-tid={`${testId}-header`}>TEST HEADER</p>{/snippet}
  <p data-tid={`${testId}-content`}>TEST CONTENT</p>
  {#snippet footer()}<p data-tid={`${testId}-footer`}>TEST FOOTER</p>{/snippet}
</BottomSheet>
