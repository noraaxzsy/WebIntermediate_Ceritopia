import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import { generateAuthenticatedNavigationListTemplate, generateMainNavigationListTemplate, generateSubscribeButtonTemplate, generateUnsubscribeButtonTemplate, generateUnauthenticatedNavigationListTemplate } from "../templates";
import { getAccessToken, getLogout } from "../utils/auth";
import { isServiceWorkerAvailable, setupSkipToContent, transitionHelper, registerServiceWorker } from "../utils";
import Swal from "sweetalert2";
import { isNotificationAvailable, isCurrentPushSubscriptionAvailable, subscribe, unsubscribe } from "../utils/notification";

class App {
  #content;
  #drawerButton;
  #navigationDrawer;
  #skipLinkButton;

  constructor({ navigationDrawer, drawerButton, content, skipLinkButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#skipLinkButton = skipLinkButton;

    this.#init();
  }
  #init() {
    setupSkipToContent(this.#skipLinkButton, this.#content);
    this._setupDrawer();
    registerServiceWorker();
  }
  _setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      const isTargetInsideDrawer = this.#navigationDrawer.contains(event.target);
      const isTargetInsideButton = this.#drawerButton.contains(event.target);

      if (!(isTargetInsideDrawer || isTargetInsideButton)) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  #setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navListMain = this.#navigationDrawer.children.namedItem("nav-list-main");
    const navList = this.#navigationDrawer.children.namedItem("nav-list");

    // User not log in
    if (!isLogin) {
      navListMain.innerHTML = "";
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    navListMain.innerHTML = generateMainNavigationListTemplate();
    navList.innerHTML = generateAuthenticatedNavigationListTemplate();

    const logoutButton = document.getElementById("logout-button");
    logoutButton.addEventListener("click", (event) => {
      event.preventDefault();
      Swal.fire({
        title: "Apakah Anda yakin ingin keluar?",
        text: "Anda akan keluar dari akun Anda.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, keluar",
        cancelButtonText: "Batal",
      }).then((result) => {
        if (result.isConfirmed) {
          getLogout();
          location.hash = "/login";
        }
      });
    });
  }

  async #setupPushNotification() {
    if (!isNotificationAvailable()) return;
    const pushNotificationTools = document.getElementById("push-notification-tools");
    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    if (isSubscribed) {
      pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
      document.getElementById("unsubscribe-button").addEventListener("click", () => {
        unsubscribe().finally(() => {
          this.#setupPushNotification();
        });
      });

      return;
    }

    pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
    document.getElementById("subscribe-button").addEventListener("click", () => {
      subscribe().finally(() => {
        this.#setupPushNotification();
      });
    });
  }

  async renderPage() {
    const url = getActiveRoute();

    let matchedRoute = null;
    let params = {};

    for (const path in routes) {
      const pathParts = path.split("/");
      const urlParts = url.split("/");

      if (pathParts.length !== urlParts.length) continue;

      const tempParams = {};
      let isMatch = true;

      for (let i = 0; i < pathParts.length; i++) {
        if (pathParts[i].startsWith(":")) {
          const paramName = pathParts[i].slice(1);
          tempParams[paramName] = urlParts[i];
        } else if (pathParts[i] !== urlParts[i]) {
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        matchedRoute = routes[path];
        params = tempParams;
        break;
      }
    }

    let page;
    if (!matchedRoute || typeof matchedRoute !== "function") {
      // Gunakan halaman Not Found jika rute tidak cocok
      const { default: NotFoundPage } = await import("./not-found/notfound-pages");
      page = new NotFoundPage();
    } else {
      page = matchedRoute(params);
    }

    if (!page) {
      return;
    }

    await transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        page.afterRender();
      },
    });

    scrollTo({ top: 0, behavior: "instant" });
    this.#setupNavigationList();

    if (isServiceWorkerAvailable()) {
      this.#setupPushNotification();
    }
  }
}

export default App;
