const files = Array.isArray(window.MEMORY_FILES)
  ? window.MEMORY_FILES
  : [];

const box = document.getElementById("events");
const modal = document.getElementById("modal");
const titleEl = document.getElementById("title");
const numEl = document.getElementById("num");
const galleryEl = document.getElementById("gallery");

// The site is static: albums are inferred only from file names.
// Format: "01-اسم الألبوم__01.jpg" and optional "01-اسم الألبوم__cover.jpg".
function parseFile(filename) {
  const match = filename.match(/^(.+?)__(cover|\d+)(\.[^.]+)$/i);
  if (!match) return null;

  return {
    filename,
    album: match[1],
    item: match[2].toLowerCase(),
    extension: match[3].toLowerCase()
  };
}

function displayTitle(album) {
  return album.replace(/^\d+[-_]/, "").replaceAll("-", " ");
}

const parsed = files
  .map(parseFile)
  .filter(Boolean);

const albums = new Map();

parsed.forEach(file => {
  if (!albums.has(file.album)) albums.set(file.album, []);
  albums.get(file.album).push(file);
});

const events = [...albums.entries()].map(([album, photos]) => ({
  album,
  name: displayTitle(album),
  photos: photos
    .filter(photo => photo.item !== "cover")
    .sort((a, b) => a.item.localeCompare(b.item, undefined, { numeric: true })),
  cover: photos.find(photo => photo.item === "cover") ||
    photos.find(photo => photo.item !== "cover") || null
}));

document.getElementById("count").textContent = `${events.length} أحداث`;

function photoUrl(filename) {
  return `photos/${encodeURIComponent(filename).replace(/%2F/g, "/")}`;
}

// Create album cards from the manifest.
events.forEach((event, i) => {
  const card = document.createElement("article");
  card.className = "event";

  const cover = event.cover ? photoUrl(event.cover.filename) : "";

  card.innerHTML = `
    <div class="cover">
      ${cover ? `<img src="${cover}" alt="${escapeHtml(event.name)}">` : ""}
      <div class="shade"></div>
    </div>
    <div class="info">
      <span class="badge">فتح الألبوم</span>
      <h3>${escapeHtml(event.name)}</h3>
      <p>اضغط لمشاهدة الذكريات</p>
    </div>
  `;

  card.onclick = () => openAlbum(i);
  box.appendChild(card);
});

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[char]);
}

function openAlbum(i) {
  const event = events[i];
  titleEl.textContent = event.name;
  numEl.textContent = `${event.photos.length} صور`;
  galleryEl.innerHTML = "";
  modal.classList.add("open");
  document.body.style.overflow = "hidden";

  if (!event.photos.length) {
    galleryEl.innerHTML = `<div class="empty">لا توجد صور داخل هذا الحدث</div>`;
    return;
  }

  galleryEl.innerHTML = event.photos.map(photo => `
    <img src="${photoUrl(photo.filename)}" loading="lazy" alt="${escapeHtml(event.name)}">
  `).join("");
}

function closeModal() {
  modal.classList.remove("open");
  document.body.style.overflow = "";
}

document.getElementById("close").onclick = closeModal;
modal.onclick = e => {
  if (e.target === modal) closeModal();
};
document.onkeydown = e => {
  if (e.key === "Escape") closeModal();
};

// =========================
// Music Player
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const music = document.getElementById("memoryMusic");
  const musicBtn = document.getElementById("musicBtn");
  const musicProgress = document.getElementById("musicProgress");
  const musicVolume = document.getElementById("musicVolume");

  if (!music || !musicBtn || !musicProgress || !musicVolume) return;

  music.volume = 0.7;

  musicBtn.addEventListener("click", async () => {
    if (music.paused) {
      try {
        await music.play();
        musicBtn.textContent = "❚❚";
      } catch (error) {
        console.error("Cannot play music:", error);
        musicBtn.textContent = "▶";
        alert("مش قادر أشغل الأغنية. تأكد إن ملف memories.mp3 موجود داخل مجلد music.");
      }
    } else {
      music.pause();
      musicBtn.textContent = "▶";
    }
  });

  music.addEventListener("timeupdate", () => {
    if (!music.duration || !isFinite(music.duration)) return;
    musicProgress.value = (music.currentTime / music.duration) * 100;
  });

  musicProgress.addEventListener("input", () => {
    if (!music.duration || !isFinite(music.duration)) return;
    music.currentTime = (musicProgress.value / 100) * music.duration;
  });

  musicVolume.addEventListener("input", () => {
    music.volume = Number(musicVolume.value);
  });
});
