import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from "workbox-strategies";
import CONFIG from "./config";

// Do precaching
const manifest = self.__WB_MANIFEST;
precacheAndRoute(manifest);

//Runtime caching
registerRoute(
  ({ url }) => {
    return url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com";
  },
  new CacheFirst({
    cacheName: "google-fonts",
  })
);

registerRoute(
  ({ url }) => {
    return url.origin === "https://ui-avatars.com";
  },
  new CacheFirst({
    cacheName: "avatars-api",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(CONFIG.BASE_URL);
    return baseUrl.origin === url.origin && request.destination !== "image";
  },
  new NetworkFirst({
    cacheName: "story-api",
  })
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(CONFIG.BASE_URL);
    return baseUrl.origin === url.origin && request.destination === "image";
  },
  new StaleWhileRevalidate({
    cacheName: "story-api-images",
  })
);

registerRoute(
  ({ url }) => {
    return url.origin.includes("maptiler");
  },
  new CacheFirst({
    cacheName: "map-api",
  })
);

self.addEventListener("push", (event) => {
  console.log("Service Worker: Push event received");

  if (!event.data) {
    console.warn("Push event tanpa payload");
    return;
  }

  let data = {};

  try {
    data = event.data.json();
    console.log("Push payload JSON:", data);
  } catch (e) {
    console.warn("Gagal parse payload, pakai teks langsung");
    data = {
      title: "Notifikasi",
      options: {
        body: event.data.text(),
      },
    };
  }

  const title = data.title || "Notifikasi";
  const options = data.options || {
    body: "Anda punya pesan baru",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
