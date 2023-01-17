<script lang="ts">
  import {
    fetchExchangeRate,
    getExchangeRateICPToUsd,
  } from "$lib/services/dashboard.services";

  const fetch = async () => await fetchExchangeRate();
  const get = async () => await getExchangeRateICPToUsd();
</script>

<main>
  <h1>Test</h1>

  <div>
    <p>Re-fetch ICP -> USD exchange rate</p>
    <button on:click={fetch} class="primary">Fetch</button>
  </div>

  <div>
    <p>Get ICP -> USD (from NNS-dapp memory)</p>
    <button on:click={get} class="primary">Get</button>
  </div>
</main>
