<script lang="ts">
  import { nonNullish } from "@dfinity/utils";
  import { stringifyJson } from "$lib/utils/utils";

  export let json: unknown;
  export let testId: string | undefined = undefined;

  let rawContent: string;
  $: rawContent = nonNullish(json)
    ? stringifyJson(json, { indentation: 2 })
    : `${json}`;
</script>

<pre data-tid={testId}>{rawContent}</pre>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  pre {
    margin: 0;
    @include fonts.small;
  }
</style>
