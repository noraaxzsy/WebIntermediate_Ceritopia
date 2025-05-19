import Database from "../../data/database";
import { generateStoryItemTemplate } from "../../templates";
import BookmarkPresenter from "./bookmark-presenter";

export default class BookmarkPage {
  #presenter = null;

  async render() {
    return `
      <section class="bookmark-page">
        <h1 class="title-bookmark-page">Cerita Tersimpan</h1>
        <div id="bookmark-list" class="bookmark-list"></div>
        <div id="loading-indicator" class="loading-indicator" style="display:none;">Loading...</div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new BookmarkPresenter({
      view: this,
      model: Database,
    });

    await this.#presenter.loadBookmarkedStories();
  }

  showLoading() {
    document.getElementById("loading-indicator").style.display = "block";
  }

  hideLoading() {
    document.getElementById("loading-indicator").style.display = "none";
  }

  showBookmarkedStories(stories) {
    this.hideLoading();
    const container = document.getElementById("bookmark-list");
    container.innerHTML = stories.map((story) => generateStoryItemTemplate(story)).join("");
  }

  showEmptyBookmarks() {
    this.hideLoading();
    const container = document.getElementById("bookmark-list");
    container.innerHTML = `<p>Belum ada cerita yang disimpan.</p>`;
  }

  showBookmarksError(message) {
    this.hideLoading();
    const container = document.getElementById("bookmark-list");
    container.innerHTML = `<p>Terjadi kesalahan: ${message}</p>`;
  }
}
