const VR360 = (() => {
  let viewer = null;

  function init(elementId, imageUrl) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    // Clear previous
    container.innerHTML = '';
    container.style.filter = 'none'; // Reset any blur on the container
    
    // Handle iframe (Google Maps embed) immediately
    if (imageUrl && imageUrl.trim().startsWith('<iframe')) {
      container.innerHTML = imageUrl;
      const iframe = container.querySelector('iframe');
      if (iframe) {
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.pointerEvents = 'auto';
      }
      return;
    }

    if (typeof pannellum === 'undefined') {
      console.error('Pannellum library not loaded');
      // Fallback
      if (container) {
        container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#000;color:#fff;">
          <p>Không thể tải thư viện VR. Vui lòng kiểm tra kết nối mạng.</p>
        </div>`;
      }
      return;
    }
    

    
    try {
      viewer = pannellum.viewer(elementId, {
        "type": "equirectangular",
        "panorama": imageUrl,
        "autoLoad": true,
        "compass": false,
        "showControls": true,
        "showFullscreenCtrl": true,
        "showZoomCtrl": true,
        "mouseZoom": true,
        "keyboardZoom": true,
        "draggable": true
      });
    } catch (e) {
      console.error("VR init error:", e);
    }
  }

  function destroy() {
    if (viewer) {
      try {
        viewer.destroy();
      } catch (e) {}
      viewer = null;
    }
  }

  return { init, destroy };
})();
