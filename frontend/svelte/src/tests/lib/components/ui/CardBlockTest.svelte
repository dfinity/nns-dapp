<script>
  import CardBlock from "../../../../lib/components/ui/CardBlock.svelte";

  export let expandable = false;
</script>

<CardBlock {expandable}>
  <h3 slot="title">title</h3>
  <p>content</p>
</CardBlock>
