<script lang="ts">
  import { Spinner } from "@dfinity/gix-components";
</script>

<span class="spinner description"><Spinner inline size="small" /></span>
<span class="description"> <small><slot /></small></span>

<style lang="scss">
  .spinner {
    display: inline-block;
    position: relative;
    vertical-align: middle;

    margin-right: var(--padding-0_5x);
  }
</style>
