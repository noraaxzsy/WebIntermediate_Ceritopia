export default class NotFoundPage {
  async render() {
    return `
      <section class="not-found">
        <img src="images/notfound-background.svg" class="bg-img">
        <div class="content-notfound">
          <h1>404 - Halaman Tidak Ditemukan</h1>
          <p>Ups! Alamat yang kamu tuju tidak tersedia.</p>
          <a href="#/">Kembali ke Halaman Utama</a>
        </div>
      </section>

    `;
  }
}
