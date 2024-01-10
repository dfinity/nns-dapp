<script lang="ts">
  import SignInNeurons from "$lib/pages/SignInNeurons.svelte";
  import Neurons from "$lib/routes/Neurons.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
</script>

{#if $authSignedInStore}
  <Neurons />
{:else}
  <SignInNeurons />
{/if}
