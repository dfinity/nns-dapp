<script lang="ts">
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import jsQR from 'jsqr';  // Make sure to install this package: npm install jsqr
  
    const dispatch = createEventDispatcher();
    let videoElement: HTMLVideoElement;
    let canvasElement: HTMLCanvasElement;
    let canvasContext: CanvasRenderingContext2D;
    let stream: MediaStream | null = null;
  
    const startScanner = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        
        if (videoElement) {
          videoElement.srcObject = stream;
          videoElement.play();
          requestAnimationFrame(tick);
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        dispatch('error', { message: 'Could not access camera' });
      }
    };
  
    const tick = () => {
      if (videoElement && videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
        canvasElement.height = videoElement.videoHeight;
        canvasElement.width = videoElement.videoWidth;
        canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        
        const imageData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
  
        if (code) {
          dispatch('scanned', { result: code.data });
          stopScanner();
          return;
        }
      }
      requestAnimationFrame(tick);
    };
  
    const stopScanner = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
      }
      dispatch('close');
    };
  
    onMount(() => {
      canvasContext = canvasElement.getContext('2d')!;
      startScanner();
    });
  
    onDestroy(() => {
      stopScanner();
    });
  </script>
  
  <div class="qr-scanner-container">
    <div class="video-container">
      <video bind:this={videoElement} playsinline></video>
      <canvas bind:this={canvasElement} hidden></canvas>
      <div class="scanner-overlay">
        <div class="scanner-frame"></div>
      </div>
    </div>
    <button class="alter-x-button" on:click={stopScanner}>X</button>
  </div>
  
  <style>
    .qr-scanner-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  
    .video-container {
      position: relative;
      width: 100%;
      max-width: 500px;
      height: 300px;
    }
  
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  
    .scanner-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  
    .scanner-frame {
      width: 200px;
      height: 200px;
      border: 2px solid #fff;
      border-radius: 12px;
    }
  
    .close-button {
      margin-top: 20px;
      padding: 8px 16px;
      background: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    /* Updated button style for 'Alter X' with a dark theme */
    .alter-x-button {
      margin-top: 20px;
      padding: 12px 20px;
      background: #333; /* dark background */
      color: #fff; /* white text */
      border: none;
      border-radius: 50px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      text-transform: uppercase;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      transition: background 0.3s, transform 0.2s ease-in-out;
    }

    /* Hover effect to lighten the button */
    .alter-x-button:hover {
      background: #555;
      transform: scale(1.05);
    }

    /* Focused state */
    .alter-x-button:focus {
      outline: none;
    }
  </style>