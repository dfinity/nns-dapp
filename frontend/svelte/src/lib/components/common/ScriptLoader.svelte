<script lang="ts">
  import { tick, onMount, createEventDispatcher } from "svelte";

  export let url: string | undefined;

  const dispatch = createEventDispatcher();
  let script: HTMLScriptElement;

  onMount(async () => {
    script.addEventListener(
      "load",
      () => {
        dispatch("nnsLoad");
      },
      { once: true }
    );

    script.addEventListener(
      "error",
      (event) => {
        console.error("script load error", event);
        dispatch("nnsError");
      },
      { once: true }
    );
  });

  /**
   * There is no script loading in unit-test environment.
   * To test ScriptLoader user component the test should mock the outcome of script loading.
   */
  if (typeof jest !== "undefined") {
    // doesn't work w/o the waiting because of child first initialization.
    tick().then(() => dispatch("nnsLoad"));
  }
</script>

<svelte:head>
  <script bind:this={script} src={url}></script>
</svelte:head>
