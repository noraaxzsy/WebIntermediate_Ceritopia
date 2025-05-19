export default class BookmarkPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async loadBookmarkedStories() {
    this.#view.showLoading();

    try {
      const stories = await this.#model.getAllReports();

      if (stories.length === 0) {
        this.#view.showEmptyBookmarks();
        return;
      }

      this.#view.showBookmarkedStories(stories);
    } catch (error) {
      console.error("loadBookmarkedStories error:", error);
      this.#view.showBookmarksError(error.message);
    }
  }
}
