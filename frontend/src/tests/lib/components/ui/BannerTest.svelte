<script lang="ts">
  import Banner from "$lib/components/ui/Banner.svelte";

  export let isClosable: boolean = false;
  export let isCritical: boolean = false;
  export let title: string | undefined = undefined;
  export let text: string | undefined = undefined;
  export let htmlText: string | undefined = undefined;
</script>

<Banner {isClosable} {isCritical} {title} {text} {htmlText}>
  <div slot="icon">
    <div>test-icon</div>
  </div>
  <div slot="actions">
    <button>test-action</button>
  </div>
</Banner>
