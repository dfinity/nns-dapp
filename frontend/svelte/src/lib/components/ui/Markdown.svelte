<script lang="ts">
  import ScriptLoader from "../common/ScriptLoader.svelte";
  import Spinner from "./Spinner.svelte";

  export let text: string | undefined;

  let loading: boolean = true;
  let parse: (string) => string;

  const onLoad = () => {
    loading = false;
    parse = globalThis?.marked?.parse;
  };
  // TODO: script loading error handling
  const onError = () => alert("Loading error");
</script>

<ScriptLoader
  url="/assets/assets/libs/marked.min.js"
  on:nnsLoad={onLoad}
  on:nnsError={onError}
/>

{#if loading}
  <Spinner />
{/if}

{#if parse}
  {@html parse(text)}
{/if}

<style lang="scss">
</style>
