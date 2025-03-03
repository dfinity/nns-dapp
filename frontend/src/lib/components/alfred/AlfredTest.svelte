<script lang="ts">
  import { toggleAlfred } from "$lib/stores/alfred";
</script>

<div class="alfred-test">
  <h2>Alfred Test</h2>
  <p>Press Cmd+K (or Ctrl+K on Windows/Linux) to open the Alfred menu</p>
  <p>Or <button on:click={toggleAlfred}>Click here</button> to open it</p>
</div>

<style>
  .alfred-test {
    padding: 20px;
    margin: 20px;
    border: 1px solid #ccc;
    border-radius: 4px;
    text-align: center;
  }
  
  button {
    padding: 8px 12px;
    background-color: var(--color-primary);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
</style> 