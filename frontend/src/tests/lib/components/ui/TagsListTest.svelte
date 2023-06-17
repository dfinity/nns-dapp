<script>
  import TagsList from "$lib/components/ui/TagsList.svelte";
</script>

<TagsList id="tid" on:nnsTitleClick>
  <span data-tid="title" slot="title">title</span>
  <li data-tid="item">item 1</li>
  <li data-tid="item">item 2</li>
</TagsList>
