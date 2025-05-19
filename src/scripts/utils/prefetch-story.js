import CONFIG from "../config";

export async function prefetchStoryDetails(stories) {
  const token = localStorage.getItem("accessToken");

  for (const story of stories) {
    const detailUrl = `${CONFIG.BASE_URL}/stories/${story.id}`;

    try {
      const response = await fetch(detailUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log(`[Prefetch] Workbox will cache this: ${detailUrl}`);
      } else {
        console.warn(`[Prefetch] Fetch failed for: ${detailUrl}`);
      }
    } catch (error) {
      console.error(`[Prefetch] Error fetching ${detailUrl}:`, error);
    }
  }
}
