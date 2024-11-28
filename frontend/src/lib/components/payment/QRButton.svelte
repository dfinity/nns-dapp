<script lang="ts">
    import { IconQRCodeScanner } from "@dfinity/gix-components";
    import { createEventDispatcher } from "svelte";
  
    export let buttonText = ""; // Optional text next to icon
    export let testId = "qr-scanner-button";
  
    const dispatch = createEventDispatcher();
  
    const handleClick = () => {
      dispatch('openScanner');
    };
  </script>
  
  <button
    type="button"
    data-tid={testId}
    class="qr-button"
    on:click={handleClick}
    aria-label="Open QR Scanner"
  >
    <IconQRCodeScanner />
    {#if buttonText}
      <span>{buttonText}</span>
    {/if}
  </button>
  
  <style>
    .qr-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 4px;
    }
  
    .qr-button:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  </style>