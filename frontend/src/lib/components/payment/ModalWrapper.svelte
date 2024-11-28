<!-- Modal.svelte -->
<script lang="ts">
    export let show: boolean = false; // Controls modal visibility
    export let title: string = ''; // Title of the modal
    export let onClose: () => void = () => {}; // Close callback function
  
    // Close the modal when clicking outside of it
    const handleOverlayClick = () => {
      onClose(); // Trigger the onClose callback
    };
  </script>
  
  {#if show}
    <div class="modal-overlay" on:click={handleOverlayClick}>
      <div class="modal-content" on:click|stopPropagation>
        <div class="modal-header">
          <h2>{title}</h2>
          <button class="close-btn" on:click={onClose}>X</button>
        </div>
        <div class="modal-body">
          <slot></slot> <!-- Dynamic content passed to the modal -->
        </div>
      </div>
    </div>
  {/if}
  
  <style lang="scss">
    /* Dark Theme Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8); /* Darker overlay */
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
  
    .modal-content {
      background: #2c2f36; /* Dark background for the modal */
      color: white; /* White text for contrast */
      padding: 2rem;
      border-radius: 8px;
      width: 500px;
      max-width: 90%;
      box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
    }
  
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
  
    .modal-body {
      margin: 1rem 0;
      font-size: 1rem;
    }
  
    .modal-footer {
      display: flex;
      justify-content: flex-end;
    }
  
    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: white;
      cursor: pointer;
    }
  
    .btn-close {
      background-color: #007bff; /* Button color */
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.3s;
    }
  
    .btn-close:hover {
      background-color: #0056b3; /* Darker blue on hover */
    }
  </style>