import HomePage from "../pages/home/home-page";
import Swal from "sweetalert2";
import BookmarkPage from "../pages/bookmark/bookmark-page";
import LoginPage from "../pages/auth/login/login-page";
import RegisterPage from "../pages/auth/register/register-page";
import StoryDetailPage from "../pages/story-detail/story-detail-page";
import NewStoryPage from "../pages/new-story/new-story-page";
import NotFoundPage from "../pages/not-found/notfound-pages";
import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from "../utils/auth";

const routes = {
  "/login": () => checkUnauthenticatedRouteOnly(new LoginPage()),
  "/register": () => checkUnauthenticatedRouteOnly(new RegisterPage()),
  "/": () => checkAuthenticatedRoute(new HomePage()),
  "/bookmark": () => checkAuthenticatedRoute(new BookmarkPage()),
  "/stories/:id": (params) => {
    const { id } = params;
    return checkAuthenticatedRoute(new StoryDetailPage({ id }));
  },
  "/new": () => checkAuthenticatedRoute(new NewStoryPage()),

  // ✅ Fallback route
  "*": () => new NotFoundPage(),
};

export default routes;
