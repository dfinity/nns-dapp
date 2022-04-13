<script lang="ts">
    import Spinner from "./Spinner.svelte";
</script>

<div class="spinner" role="presentation">
    <Spinner />
</div>

<style lang="scss">
    .spinner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(0, calc(-1 * (var(--footer-height) / 5)));
    }
</style>
