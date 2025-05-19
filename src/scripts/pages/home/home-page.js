import HomePresenter from "./home-presenter";
import * as StoryAPI from "../../data/api";
import { generateLoaderAbsoluteTemplate, generateStoryItemTemplate } from "../../templates";

export default class HomePage {
  #presenter = null;
  async render() {
    return `
      <section class="container-1">
      <article class="notes-heropage">  
        <h1 class="title" id="firstTitle">Tell.</h1>
        <h1 class="title" id="secondTitle">Create.</h1>
        <h1 class="title" id="thirdTitle">Share.</h1>
        <p class="synopsis">Mulailah dengan sebuah cerita, ciptakan dunia yang hanya bisa lahir dari imajinasimu, dan bagikan kisah itu untuk menginspirasi, menghubungkan, dan menggerakkan hati banyak orang.</p>
        <a id="cerita-btn" class="cerita-btn" href="#">Lihat cerita</a>
      </article>
      <aside>
        <img src="images/Image gallery.png" alt="image gallery" class="image-heropage">
      </aside>
      </section>

      <section class="container-2" id="gallery-cerita">
      <h1 class="section-title">Cerita Kami</h1>

      <div class="story-list__container">
        <div id="story-list"></div>
        <div id="story-list-loading-container"></div>
      </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: StoryAPI,
    });

    await this.#presenter.initialStoryList();
  }

  populateStoryList(message, stories) {
    if (stories.length <= 0) {
      this.populateStoryListEmpty();
      return;
    }

    const html = stories.reduce((accumulator, story) => {
      return accumulator + generateStoryItemTemplate(story);
    }, "");

    document.getElementById("story-list").innerHTML = `
      <div class="story-list">${html}</div>
    `;
  }

  populateStoryListEmpty() {
    document.getElementById("story-list").innerHTML = `
      <p class="empty-message">Belum ada cerita tersedia.</p>
    `;
  }

  populateStoryListError(message) {
    document.getElementById("story-list").innerHTML = `
      <p class="error-message">Gagal memuat cerita: ${message}</p>
    `;
  }

  showLoading() {
    document.getElementById("story-list-loading-container").innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    document.getElementById("story-list-loading-container").innerHTML = "";
  }
}
