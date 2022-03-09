<script lang="ts">
  import ScriptLoader from "../common/ScriptLoader.svelte";
  import Spinner from "./Spinner.svelte";
  import { removeHTMLTags } from "../../utils/security.utils";

  export let text: string | undefined;

  // do not load the lib if available
  let parse: (string) => string | undefined = globalThis?.marked?.parse;
  let loading: boolean = parse === undefined;

  const onLoad = () => {
    loading = false;
    parse = globalThis?.marked?.parse;
  };
  const onError = () => {
    loading = false;
  };
</script>

{#if loading}
  <Spinner />
  <ScriptLoader
    url="/assets/assets/libs/marked.min.js"
    on:nnsLoad={onLoad}
    on:nnsError={onError}
  />
{:else if parse}
  {@html parse(removeHTMLTags(text))}
{:else}
  <!-- fallback text content -->
  {text}
{/if}
