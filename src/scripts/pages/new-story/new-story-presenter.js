import { addNewStory } from "../../data/api";
import Swal from "sweetalert2";
import { isCurrentPushSubscriptionAvailable } from "../../utils/notification";
class NewStoryPresenter {
  constructor({ form, resultContainer }) {
    this.form = form;
    this.resultContainer = resultContainer;
  }

  async init() {
    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const description = this.form.querySelector("#description").value.trim();
      const imageInput = this.form.querySelector("#image");
      const lat = this.form.querySelector("[name='latitude']").value || null;
      const lon = this.form.querySelector("[name='longitude']").value || null;
      if (!lat || !lon) {
        console.error("Input lokasi tidak ditemukan");
        return;
      }

      if (!description || imageInput.files.length === 0) {
        this.showResult("❌ Deskripsi dan gambar wajib diisi.", false);
        return;
      }

      const imageFiles = Array.from(imageInput.files);

      try {
        const response = await addNewStory({
          description,
          image: imageFiles,
          latitude: lat,
          longitude: lon,
        });

        if (response.error) {
          this.showResult(`❌ ${response.message}`, false);
        } else {
          this.showResult("Silahkan lihat cerita di galeri", true);
          this.form.reset();
          // Kirim pesan ke service worker
          // Kirim pesan ke service worker untuk show notification
          // if (navigator.serviceWorker.controller) {
          //   console.log("berhasil push");
          //   navigator.serviceWorker.controller.postMessage({
          //     type: "NEW_STORY_UPLOADED",
          //     title: "Cerita Baru!",
          //     body: "Cerita kamu berhasil diunggah.",
          //   });
          // }
          // const isSubscribed = await isCurrentPushSubscriptionAvailable();
          // if (Notification.permission === "granted" && isSubscribed) {
          //   new Notification("Story berhasil dibuat", {
          //     body: `Deskripsi: ${description}`,
          //   });
          // }
        }
      } catch (err) {
        console.error(err);
        this.showResult("❌ Terjadi kesalahan saat mengunggah cerita.", false);
      }
    });
  }

  showResult(message, isSuccess) {
    console.log(`${message}, ${isSuccess}`);
    Swal.fire({
      title: isSuccess ? "Cerita Berhasil Diunggah!🐣" : "Cerita Gagal Diunggah!🥺",
      text: message,
      icon: isSuccess ? "success" : "error",
      confirmButtonText: "OK",
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed && isSuccess) {
        window.location.href = "/";
      }
    });
  }
}

export default NewStoryPresenter;
