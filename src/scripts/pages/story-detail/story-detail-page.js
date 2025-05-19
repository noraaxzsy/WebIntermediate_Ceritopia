import StoryDetailPresenter from "./story-detail-presenter";
import Map from "../../utils/map";
import Database from "../../data/database";
import { getPlaceName, generateLoaderAbsoluteTemplate, generateSaveStoryButtonTemplate, generateRemoveStoryButtonTemplate } from "../../templates";

class StoryDetailPage {
  #map = null;
  #presenter = null;

  constructor(params) {
    this.params = params;
  }

  async render() {
    return `
      <section id="story-detail" class="story-detail">
        ${generateLoaderAbsoluteTemplate()}
      </section>
    `;
  }

  async afterRender() {
    const container = document.getElementById("story-detail");
    this.#presenter = new StoryDetailPresenter({
      container,
      storyId: this.params.id,
    });

    await this.#presenter.render();
    await this.renderSaveButton();
    await this.initialMap();
  }

  async renderSaveButton() {
    const container = document.getElementById("save-actions-container");
    const story = this.#presenter.story;

    if (!story || !container) return;

    const saved = await Database.getReport(story.id);
    container.innerHTML = saved ? generateRemoveStoryButtonTemplate() : generateSaveStoryButtonTemplate();

    const button = document.getElementById(saved ? "story-detail-remove" : "story-detail-save");
    button.addEventListener("click", async () => {
      if (saved) {
        await Database.deleteReport(story.id);
      } else {
        await Database.putReport(story);
      }
      await this.renderSaveButton();
    });
  }

  async initialMap() {
    const location = this.#presenter.getStoryLocation();
    if (location) {
      this.#map = await Map.build("#map", {
        zoom: 15,
        center: location,
        locate: false,
      });

      const [lat, lon] = location;
      const placeName = await getPlaceName(lat, lon).catch(() => `${lat}, ${lon}`);

      this.#map.addMarker(location, {}, { content: placeName });
    } else {
      this.#map = await Map.build("#map", {
        zoom: 15,
      });
    }
  }
}

export default StoryDetailPage;
