(function () {
  console.log("testing");
  // for getting any kind of data id's from the script
  const script = document.currentScript;
  const currentWebsite = script?.getAttribute("data-website");
  console.log(currentWebsite);

  const isLocal = true;
  const baseUrl = isLocal ? "http://localhost:3000" : "";
  const iframe = document.createElement("iframe");
  iframe.src = `${baseUrl}`;
  iframe.id = "widget-iframe-chat-bot-id";
  iframe.style.width = "120px";
  iframe.style.height = "90px";

  iframe.style.minWidth = "120px";
  iframe.style.minHeight = "90px";

  iframe.style.maxWidth = "100vw";
  iframe.style.maxHeight = "100vh";

  iframe.style.position = "fixed";
  iframe.style.bottom = "10px";
  iframe.style.right = "0";
  iframe.style.border = "none";
  iframe.style.borderRadius = "12px";
  iframe.style.overflow = "hidden";
  iframe.style.zIndex = "999999";

  document.body.appendChild(iframe);

  window.addEventListener("message", function () {
    if (event.origin !== baseUrl) return;

    if (event.data && this.event.data.type === "resize") {
      const allStyles = { ...event.data.properties };

      for (let styles in allStyles) {
        iframe.style[styles] = allStyles[styles];
      }
    }
  });
})();
