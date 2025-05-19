export function generateLoaderTemplate() {
  return `
      <div class="loader"></div>
    `;
}

export function generateLoaderAbsoluteTemplate() {
  return `
      <div class="loader loader-absolute"></div>
    `;
}

export function generateMainNavigationListTemplate() {
  return `
      <li><a id="cerita-kami" class="cerita-kami" href="#/">Cerita Kami</a></li>
      <li><a id="bookmark" class="bookmark" href="#/bookmark">Tersimpan</a></li>
    `;
}

export function generateUnauthenticatedNavigationListTemplate() {
  return `
      <li><a id="btn login-button" href="#/login">Masuk</a></li>
      <li><a id="register-button" href="#/register">Daftar</a></li>
    `;
}

export function generateAuthenticatedNavigationListTemplate() {
  return `
      <li id="push-notification-tools" class="push-notification-tools"></li>
      <li><a id="new-story" class="btn new-story" href="#/new">Unggah Cerita <i class="fas fa-plus"></i></a></li>
      <li><a id="logout-button" class="logout-button" href="#/logout"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
    `;
}

export function generateReportsListEmptyTemplate() {
  return `
      <div id="story-list-empty" class="story_list-empty">
        <h2>Tidak ada cerita yang tersedia</h2>
        <p>Saat ini, tidak ada cerita yang dapat ditampilkan.</p>
      </div>
    `;
}

export function generateReportsListErrorTemplate(message) {
  return `
      <div id="story-list-error" class="story_list-error">
        <h2>Terjadi kesalahan dalam menampilkan cerita</h2>
        <p>${message ? message : "Gunakan jaringan lain atau laporkan error ini."}</p>
      </div>
    `;
}

export function generateReportDetailErrorTemplate(message) {
  return `
      <div id="story-detail-error" class="story_detail-error">
        <h2>Terjadi kesalahan dalam menampilkan detail cerita</h2>
        <p>${message ? message : "Gunakan jaringan lain atau laporkan error ini."}</p>
      </div>
    `;
}

export function generateStoryItemTemplate({ id, name, description, photoUrl, createdAt }) {
  return `
    <section tabindex="0" class="story-item" data-storyid="${id}">
      <img class="story-item__image" src="${photoUrl}" alt="Foto dari ${name}" />
      <div class="story-item__body">
        <p class="story-item__description">${description}</p>
        <div class="story-item__meta">
          <div class="story-item__createdat">
            <i class="fas fa-calendar-alt"></i> ${new Date(createdAt).toLocaleDateString("id-ID")}
          </div>
          <div class="story-item__author">
            <i class="fas fa-user"></i> Diposting oleh: ${name}
          </div>
        </div>
        <a class="btn story-item__read-more" href="#/stories/${id}">
          Baca selengkapnya <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </section>
  `;
}

export async function generateStoryDetailTemplate(story) {
  const placeName = await getPlaceName(story.lat, story.lon);
  return `
    <section class="story-detail-card">
    <div class="detail-1">
    <img src="${story.photoUrl}" alt="${story.name}" class="story-photo" />
      <div class="title-story-detail">
      <h2 class="story-name">@${story.name} • <img src="images/calendar-icon.png" alt="calendar-icon"> ${new Date(story.createdAt).toLocaleString()}</h2>
      <div id="save-actions-container"></div>
      </div>
      <p class="story-description">${story.description}</p>
    </div>  
    <div class="detail-2">
      <h2 class="story-location">Lokasi • ${placeName}</h2>
      <div class="map-container">
        <div class="map" id="map"></div>
      </div>
    </div>
    
    </section>
  `;
}
export async function getPlaceName(lat, lon) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
      headers: {
        "User-Agent": "YourAppName/1.0 (your@email.com)",
      },
    });

    const data = await response.json();
    const address = data.address || {};

    // Hanya ambil road, state, dan country
    const components = [];
    if (address.road) components.push(address.road);
    if (address.state) components.push(address.state);
    if (address.country) components.push(address.country);

    return components.length > 0 ? components.join(", ") : `${lat}, ${lon}`;
  } catch (error) {
    return `${lat}, ${lon}`;
  }
}

export function generateSubscribeButtonTemplate() {
  return `
    <button id="subscribe-button" class="btn subscribe-button">
      Subscribe <i class="fas fa-bell"></i>
    </button>
  `;
}

export function generateUnsubscribeButtonTemplate() {
  return `
    <button id="unsubscribe-button" class="btn unsubscribe-button">
      Unsubscribe <i class="fas fa-bell-slash"></i>
    </button>
  `;
}

export function generateSaveStoryButtonTemplate() {
  return `
    <button id="story-detail-save" class="btn btn-transparent">
      Simpan Cerita <i class="far fa-bookmark"></i>
    </button>
  `;
}

export function generateRemoveStoryButtonTemplate() {
  return `
    <button id="story-detail-remove" class="btn btn-transparent">
      Buang Cerita <i class="fas fa-bookmark"></i>
    </button>
  `;
}
