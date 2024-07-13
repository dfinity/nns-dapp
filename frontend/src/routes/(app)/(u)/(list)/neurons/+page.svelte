<script lang="ts">
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import SignInNeurons from "$lib/pages/SignInNeurons.svelte";
  import Neurons from "$lib/routes/Neurons.svelte";
</script>

{#if $authSignedInStore}
  <Neurons />
{:else}
  <SignInNeurons />
{/if}
