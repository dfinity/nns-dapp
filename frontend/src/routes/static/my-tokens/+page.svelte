<script lang="ts">
  import MyTokens from "$lib/pages/MyTokens.svelte";

  // This is rendered in `/static/my-tokens/`.

  // This would be a mocked data. Or we could put the mocked data in stores and use the same derived store.
  const data = [
    { name: "ICP", balance: "3.14", id: "1" },
    { name: "Open Chat", balance: "1.2311", id: "2" },
  ];
</script>

<MyTokens {data} />
