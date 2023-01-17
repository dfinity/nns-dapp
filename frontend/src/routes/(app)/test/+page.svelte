<script lang="ts">
  import { fetchExchangeRate } from "$lib/services/dashboard.services";

  const fetch = async () => await fetchExchangeRate();
</script>

<main>
  <h1>Test</h1>

  <div>
    <p>Update ICP -> USD exchange rate</p>
    <button on:click={fetch} class="primary">Fetch</button>
  </div>
</main>
