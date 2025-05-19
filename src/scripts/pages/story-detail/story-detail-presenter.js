import { getStoryById } from "../../data/api";
import { generateStoryDetailTemplate } from "../../templates";

class StoryDetailPresenter {
  constructor({ container, storyId }) {
    this.container = container;
    this.storyId = storyId;
    this.story = null;
  }

  async render() {
    try {
      const result = await getStoryById(this.storyId);

      if (result.error) {
        this.container.innerHTML = `<p class="error">❌ ${result.message}</p>`;
        return;
      }

      if (result.story) {
        this.story = result.story;
        this.container.innerHTML = await generateStoryDetailTemplate(result.story);
      } else {
        this.container.innerHTML = `<p class="error">❌ Story not found or access denied.</p>`;
      }
    } catch (error) {
      console.error(error);
      this.container.innerHTML = `<p class="error">❌ Failed to fetch story details.</p>`;
    }
  }

  getStoryLocation() {
    if (!this.story || !this.story.lat || !this.story.lon) return null;
    return [this.story.lat, this.story.lon];
  }
}

export default StoryDetailPresenter;
