import { prefetchStoryDetails } from "../../utils/prefetch-story";

export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async initialStoryList() {
    this.#view.showLoading();
    try {
      const response = await this.#model.getAllStory();

      if (!response.ok) {
        this.#view.populateStoryListError(response.message);
        return;
      }
      const stories = response.listStory;

      this.#view.populateStoryList(response.message, stories);

      prefetchStoryDetails(stories);
    } catch (error) {
      this.#view.populateStoryListError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
