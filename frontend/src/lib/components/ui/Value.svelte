<script lang="ts">
  export let ariaLabel: string | undefined = undefined;
</script>

<span class="value" aria-label={ariaLabel}>
  <slot />
</span>
