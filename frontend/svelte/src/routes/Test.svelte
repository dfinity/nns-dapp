<script lang="ts">
  import { marked } from "marked";
  export let a = "hello";

  $: a = marked(a || "");
  console.log("hello test", a);
</script>

<h1>Test {@html a}</h1>

<style lang="scss">
  h1 {
    visibility: hidden;
  }
</style>
