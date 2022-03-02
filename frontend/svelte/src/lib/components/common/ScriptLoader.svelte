<script lang="ts">
  import { tick, onMount, createEventDispatcher, onDestroy } from "svelte";
  import { isNode } from "../../utils/dev.utils";

  export let url: string | undefined;

  const dispatch = createEventDispatcher();
  let script: HTMLScriptElement;

  const onErro = (event) => {
    console.error("script load error", event);
    dispatch("nnsError");
  };
  const onLoad = () => dispatch("nnsLoad");

  onMount(() => {
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onErro, { once: true });
  });

  onDestroy(() => {
    script.removeEventListener("load", onLoad);
    script.removeEventListener("error", onErro);
  });

  /**
   * There is no script loading in unit-test environment.
   * To test a component that uses ScriptLoader the test could mock the globalThis.marked.parse function
   *
   * @example
   * globalThis.marked = {parse: jest.fn(() => "<div>some parse result</div>")};
   */
  if (isNode()) {
    // doesn't work w/o delay because of child first initialization
    tick().then(() => dispatch("nnsLoad"));
  }
</script>

<svelte:head>
  <script bind:this={script} src={url}></script>
</svelte:head>
