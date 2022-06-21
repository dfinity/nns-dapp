<script lang="ts">
  import Header from "../../../../lib/components/common/Header.svelte";
</script>

<Header>
  <div data-tid="header-test-slot" />
  <div data-tid="header-test-start-slot" slot="start" />
</Header>
