<script lang="ts">
  import { nonNullish } from "@dfinity/utils";
  import { stringifyJson } from "$lib/utils/utils";

  export let data: object | string | number | null | undefined;

  let rawContent: string | undefined | null;
  $: rawContent = nonNullish(data)
    ? stringifyJson(data, { indentation: 2 })
    : data;
</script>

<pre>{rawContent}</pre>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  pre {
    margin: 0;
    overflow-x: auto;
    @include fonts.standard;
  }
</style>
