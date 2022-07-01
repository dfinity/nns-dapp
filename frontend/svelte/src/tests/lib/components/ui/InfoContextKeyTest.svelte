<script lang="ts">
  import InfoContextKey from "../../../../lib/components/ui/InfoContextKey.svelte";

  export let header: string;
  export let content: string;
</script>

<InfoContextKey>
  <span slot="header">{header}</span>
  <p>{content}</p>
</InfoContextKey>
