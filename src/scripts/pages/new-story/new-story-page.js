import NewStoryPresenter from "./new-story-presenter";
import Camera from "../../utils/camera";
import Map from "../../utils/map";
import { getPlaceName } from "../../templates";

class NewStoryPage {
  #map = null;
  #marker = null;

  render() {
    return `
        <section class="new-story-page container">
          <h2 class="title-new-story">Unggah Ceritamu</h2>
          <form class="new-story-form" id="new-story-form">
            <div class="form-data">
              <label class="label" for="description">Ada cerita apa hari ini?</label>
              <textarea id="description" name="description" required></textarea>
            </div>
            <div class="form-data">
              <label class="label" for="image">Masukkan dokumentasi cerita:</label>
              <div class="button-form">
                  <!-- Pilih File -->
                  <label for="image" class="custom-file-button">Pilih File</label>
                  <input type="file" id="image" name="image" accept="image/*" required multiple hidden>
                  <button id="open-documentations-camera-button" class="custom-file-button" type="button">Buka Kamera</button>
              </div>
              
              <div id="camera-container" class="new-form__camera__container">
                  <video id="camera-video" class="new-form__camera__video">
                    Video stream not available.
                  </video>
                  <canvas id="camera-canvas" class="new-form__camera__canvas"></canvas>
  
                  <div class="new-form__camera__tools">
                    <select id="camera-select"></select>
                    <div class="new-form__camera__tools_buttons">
                      <button id="camera-take-button" type="button">
                        Ambil Gambar
                      </button>
                    </div>
                  </div>
                </div>
                <div id="image-preview" class="image-preview"></div>
            </div>
            <div class="form-control">
              <div class="new-form-location-title">Masukkan lokasi cerita:</div>
  
              <div class="new-form__location__container">
                <div class="new-map-container">
                  <div class="map" id="map"></div>
                  <div id="map-loading-container"></div>
                </div>
                <div class="new-form__location__lat-lng">
                  <input type="number" name="latitude" value="-6.175389" readonly>
                  <input type="number" name="longitude" value="106.827139" readonly>
                </div>
              </div>
            </div>
            <div class="button-form">
              <button id="submit" type="submit">Unggah</button>
              <button id="batal" type="button">Batal</button>
            </div>
          </form>
          <div id="upload-result"></div>
        </section>
      `;
  }

  async afterRender() {
    const form = document.querySelector("#new-story-form");
    const resultContainer = document.querySelector("#upload-result");
    const textarea = document.getElementById("description");

    textarea.addEventListener("input", () => {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    });

    const fileInput = document.getElementById("image");
    const previewContainer = document.getElementById("image-preview");
    const openCameraButton = document.getElementById("open-documentations-camera-button");

    const label = document.querySelector('label[for="image"]');
    label.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", () => {
      previewContainer.innerHTML = "";
      const files = Array.from(fileInput.files);

      files.forEach((file) => {
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = () => {
          const img = document.createElement("img");
          img.src = reader.result;
          img.classList.add("preview-image");
          img.title = "Klik untuk menghapus";
          img.style.cursor = "pointer";

          img.dataset.fileName = file.name;
          img.dataset.fileSize = file.size;

          img.addEventListener("click", () => {
            const remainingFiles = Array.from(fileInput.files).filter((f) => !(f.name === file.name && f.size === file.size));
            const dataTransfer = new DataTransfer();
            remainingFiles.forEach((f) => dataTransfer.items.add(f));
            fileInput.files = dataTransfer.files;
            img.remove();
          });

          previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
      });
    });

    const presenter = new NewStoryPresenter({ form, resultContainer });
    presenter.init();

    // Inisialisasi kamera
    const camera = new Camera({
      video: document.getElementById("camera-video"),
      cameraSelect: document.getElementById("camera-select"),
      canvas: document.getElementById("camera-canvas"),
    });
    let isCameraOpen = false;

    openCameraButton.addEventListener("click", async () => {
      if (!isCameraOpen) {
        await camera.launch();
        openCameraButton.textContent = "Tutup Kamera";
        document.getElementById("camera-container").style.display = "block";
      } else {
        camera.stop();
        openCameraButton.textContent = "Buka Kamera";
        document.getElementById("camera-container").style.display = "none";
      }
      isCameraOpen = !isCameraOpen;
    });

    camera.addCheeseButtonListener("#camera-take-button", async () => {
      const blob = await camera.takePicture();
      if (!blob) return;

      const file = new File([blob], `camera-${Date.now()}.png`, {
        type: "image/png",
      });

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;

      previewContainer.innerHTML = "";

      const reader = new FileReader();
      reader.onload = () => {
        const img = document.createElement("img");
        img.src = reader.result;
        img.classList.add("preview-image");
        img.title = "Klik untuk menghapus";
        img.style.cursor = "pointer";

        img.dataset.fileName = file.name;
        img.dataset.fileSize = file.size;

        img.addEventListener("click", () => {
          fileInput.value = "";
          img.remove();
        });

        previewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    });

    // Inisialisasi peta
    await this.initializeMap();

    document.getElementById("batal").addEventListener("click", () => {
      window.history.back();
    });
  }
  async initializeMap() {
    console.log("Map container:", document.querySelector("#map"));
    console.log("Container dimensions:", document.querySelector("#map").offsetWidth, document.querySelector("#map").offsetHeight);

    const latInput = document.querySelector("input[name='latitude']");
    const lngInput = document.querySelector("input[name='longitude']");
    const defaultLocation = [-6.175389, 106.827139];

    try {
      const position = await this.getCurrentPosition();
      const userLocation = [position.coords.latitude, position.coords.longitude];
      const placeName = await getPlaceName(...userLocation);

      this.#map = await Map.build("#map", {
        zoom: 15,
        center: userLocation,
        locate: false,
      });

      this.#marker = this.#map.addMarker(
        userLocation,
        {
          draggable: true,
          autoPan: true,
        },
        {
          content: placeName,
        }
      );

      latInput.value = defaultLocation[0];
      lngInput.value = defaultLocation[1];
    } catch (error) {
      console.error("Gagal mendapatkan lokasi:", error);
      this.#map = await Map.build("#map", {
        zoom: 15,
        center: defaultLocation,
        locate: false,
      });

      this.#marker = this.#map.addMarker(
        defaultLocation,
        {
          draggable: true,
          title: "Drag untuk mengubah lokasi",
        },
        {
          content: "Lokasi default",
        }
      );

      latInput.value = defaultLocation[0];
      lngInput.value = defaultLocation[1];
    }

    this.#marker.on("dragend", async () => {
      const position = this.#marker.getLatLng();
      latInput.value = position.lat;
      lngInput.value = position.lng;

      try {
        const placeName = await getPlaceName(position.lat, position.lng);
        this.#marker.bindPopup(placeName).openPopup();
      } catch (e) {
        this.#marker.bindPopup(`Lat: ${position.lat.toFixed(6)}, Lng: ${position.lng.toFixed(6)}`).openPopup();
      }
    });

    // Event saat klik di peta
    this.#map.getLeafletMap().on("click", async (event) => {
      const { lat, lng } = event.latlng;
      this.#marker.setLatLng([lat, lng]);
      latInput.value = lat;
      lngInput.value = lng;

      try {
        const placeName = await getPlaceName(lat, lng);
        this.#marker.bindPopup(placeName).openPopup();
      } catch (err) {
        this.#marker.bindPopup(`Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`).openPopup();
      }
    });
  }
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation tidak didukung");
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      });
    });
  }
}

export default NewStoryPage;
