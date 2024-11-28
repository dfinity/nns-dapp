<script lang="ts">
    import { i18n } from "$lib/stores/i18n";
    // Props passed from parent component
    export let source: string | undefined;          // Source: merchant_name
    export let destination: string | undefined;     // Destination: merchant_address
    export let amount: number | undefined;          // Amount
    export let scannedValue: any;                   // The full scanned value (optional, if needed)
    export let buttonText: string;
    export let digestStore: string | null;
    export let handleOnPaymentNow: () => void; // Function to handle the payment

    let dropdownValue = "main";

    const handleTransaction = async () => {
        if (scannedValue && scannedValue.amount) {
            handleOnPaymentNow();
        } 
    };
</script>

{#if digestStore === null}
  <form
    on:submit|preventDefault={handleTransaction}
    data-tid="confirm-disburse-screen"
    class="payment-form"
  >
    <div class="form-field">
      <label for="source" class="label">Source</label>
      <select id="source" class="value" bind:value={dropdownValue}>
        <option value="main" selected>Main</option>
      </select>
    </div>
    <div class="form-field">
      <label for="merchant-name" class="label">
        Name
      </label>
      <p id="merchant-name" class="value">{source}</p>
    </div>
    <div class="form-field">
      <label for="destination" class="label">{$i18n.accounts.destination}</label>
      <p id="destination" class="value">{destination}</p>
    </div>
    <div class="form-field">
        <label for="amount" class="label">Network</label>
        <p id="coin_name" class="value">{"Internet Computer"}</p>
      </div>
    <div class="form-field">
      <label for="amount" class="label">Order Id</label>
      <p id="order_id" class="value">{scannedValue.order_id}</p>
    </div>
    <div class="form-field">
      <label for="amount" class="label">Amount</label>
      <p id="amount" class="value">{`${amount} ${scannedValue.coin_name}`}</p>
    </div>
    <div class="form-field">
      <button type="submit" class="btn-pay-now" on:click={handleTransaction}>
        {buttonText}
      </button>
    </div>
  </form>
{:else}
  <div class="success-message">
    <p>Your transaction was placed successfully!</p>
  </div>
{/if}

<style lang="scss">
  .payment-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 2rem;
    background-color: #2c2f36;
    color: white;
    border-radius: 8px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 400px;
  }

  .form-field {
    display: flex;
    flex-direction: column;
  }

  .label {
    font-weight: bold;
    color: #aaa;
  }

  .value {
    font-size: 1rem;
    color: white;
    margin-top: 0.25rem;
    padding: 0.5rem;
    background-color: #3e454e;
    border-radius: 4px;
  }

  .btn-pay-now {
    background-color: #007bff;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    margin-top: 1rem;
    transition: background-color 0.3s;
  }

  .btn-pay-now:hover {
    background-color: #0056b3;
  }

  select {
    padding: 0.5rem;
    background-color: #3e454e;
    color: white;
    border-radius: 4px;
    border: 1px solid #444;
  }

  /* Success message styling */
  .success-message {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    background-color: #4caf50;
    color: white;
    border-radius: 8px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
    font-size: 1.2rem;
    text-align: center;
  }

  /* Responsive layout */
  @media (max-width: 600px) {
    .payment-form {
      width: 90%;
    }
  }
</style>