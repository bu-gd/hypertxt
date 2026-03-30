// =============================================================================
// egg
// =============================================================================
const egg = document.getElementById('egg');
const eggModal = document.getElementById('egg-modal');
const eggClose = document.getElementById('egg-close');

eggModal.style.display = 'none';

egg.addEventListener('click', () => {
  eggModal.style.display = 'block';
  egg.style.color = 'var(--color-r)';
});

eggClose.addEventListener('click', () => {
  eggModal.style.display = 'none';
  egg.style.color = 'var(--color-b)';
});

eggModal.addEventListener('click', () => {
  eggModal.style.display = 'none';
  egg.style.color = 'var(--color-b)';
});

eggModal.querySelector('.modal-content').addEventListener('click', (e) => {
  e.stopPropagation();
});

// =============================================================================
// side menu
// =============================================================================
const introBtn = document.querySelector('.side-l button');
const galleryBtn = document.querySelector('.side-r button');
const closeBtnIntro = document.getElementById('page-intro-close');
const closeBtnGallery = document.getElementById('page-gallery-close');

const pageIntro = document.getElementById('page-intro');
const pageGallery = document.getElementById('page-gallery');

pageIntro.style.display = 'none';
pageGallery.style.display = 'none';

function resetButtons() {
  introBtn.classList.remove('active');
  galleryBtn.classList.remove('active');
}

function showPage(type) {
  const isIntro = type === 'intro';
  const isGallery = type === 'gallery';

  pageIntro.style.display = isIntro ? 'block' : 'none';
  pageGallery.style.display = isGallery ? 'block' : 'none';

  resetButtons();

  if (isIntro) introBtn.classList.add('active');
  if (isGallery) galleryBtn.classList.add('active');
}

introBtn.addEventListener('click', () => {
  const isOpen = pageIntro.style.display === 'block';
  showPage(isOpen ? null : 'intro');
});

galleryBtn.addEventListener('click', () => {
  const isOpen = pageGallery.style.display === 'block';
  showPage(isOpen ? null : 'gallery');
});

closeBtnIntro.addEventListener('click', () => {
  pageIntro.style.display = 'none';
  introBtn.classList.remove('active');
});

closeBtnGallery.addEventListener('click', () => {
  pageGallery.style.display = 'none';
  galleryBtn.classList.remove('active');
});


// =============================================================================
// poster + interaction system
// =============================================================================
const nameList = document.getElementById('name-list');
const hyper = document.getElementById('hyper');
const stage = document.getElementById('poster-stage');
const closeBtn = document.getElementById('closeBtn');

hyper.textContent = 'hyper';

let intervalId = null;
let isPaused = false;
let isLocked = false;

fetch('data.json')
  .then(res => res.json())
  .then(data => {

    let lastIndex = -1;
    let posters = [];

    // ---------------------------
    // position functions
    // ---------------------------
    function getRandomPosition() {
      const rect = stage.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const range = 500;

      return {
        x: cx + (Math.random() * 2 - 1) * range,
        y: cy + (Math.random() * 2 - 1) * range
      };
    }

    function getCenterPosition(range = 200) {
      const rect = stage.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      return {
        x: cx + (Math.random() * 2 - 1) * range,
        y: cy + (Math.random() * 2 - 1) * range
      };
    }

    // ---------------------------
    // poster functions
    // ---------------------------
    function addPoster(src) {
      if (!src) return;

      const img = document.createElement('img');
      img.src = src;
      img.className = 'poster';

      const { x, y } = getRandomPosition();
      img.style.left = x + 'px';
      img.style.top = y + 'px';

      const rotation = Math.random() * 40 - 20;
      img.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;

      stage.appendChild(img);
      posters.push(img);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          img.classList.add('show');
        });
      });

      if (posters.length > 4) {
        const old = posters.shift();
        old.classList.remove('show');
        old.classList.add('hide');

        setTimeout(() => old.remove(), 800);
      }
    }

    function addFocusedPoster(src) {
      if (!src) return;

      const img = document.createElement('img');
      img.src = src;
      img.className = 'poster';

      const { x, y } = getCenterPosition(0);

      img.style.left = x + 'px';
      img.style.top = y + 'px';

      img.style.transform = `translate(-50%, -50%)`;
      img.style.width = "85%";
      img.style.maxWidth = "none";

      stage.appendChild(img);
      posters.push(img);

      focusedPoster = img; 

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          img.classList.add('show');
        });
      });
    }

    function clearPosters() {
      posters.forEach(p => p.remove());
      posters = [];
    }

    // ---------------------------
    // hyper update
    // ---------------------------
    function updateHyper() {
      if (isPaused || isLocked) return;

      let i;
      do {
        i = Math.floor(Math.random() * data.length);
      } while (i === lastIndex && data.length > 1);

      lastIndex = i;

      const selected = data[i];

      hyper.textContent = selected["name-first"];
      hyper.style.color = "var(--color-r)";

      addPoster(selected.poster);
    }

    // ---------------------------
    // loop control
    // ---------------------------
    function startLoop() {
      intervalId = setInterval(updateHyper, 3000);
    }

    function stopLoop() {
      clearInterval(intervalId);
    }

    // ---------------------------
    // name list + interactions
    // ---------------------------
    data.forEach(person => {
      const div = document.createElement('div');
      div.className = 'name';

      const first = document.createElement('span');
      first.className = 'name-first';
      first.textContent = person["name-first"];

      const last = document.createElement('span');
      last.className = 'name-last';
      last.textContent = person["name-last"];

      div.appendChild(first);
      div.appendChild(document.createTextNode(' '));
      div.appendChild(last);

      // ---------------------------
      // hover (preview)
      // ---------------------------
      div.addEventListener('mouseenter', () => {
        if (isLocked) return;

        isPaused = true;
        stopLoop();

        hyper.textContent = person["name-first"];

        clearPosters();
        addPoster(person.poster);

        // contact
        const website = document.getElementById('website');
        const insta1 = document.getElementById('instagram1');
        const insta2 = document.getElementById('instagram2');

        website.href = person.website ? `https://${person.website}` : '#';
        website.textContent = person.website || '';

        insta1.href = person.instagram1 ? `https://instagram.com/${person.instagram1}` : '#';
        insta1.textContent = person.instagram1 ? `@${person.instagram1}` : '';

        insta2.href = person.instagram2 ? `https://instagram.com/${person.instagram2}` : '#';
        insta2.textContent = person.instagram2 ? `@${person.instagram2}` : '';
      });

      div.addEventListener('mouseleave', () => {
        if (isLocked) return;

        isPaused = false;
        updateHyper();
        startLoop();
      });

      // ---------------------------
      // click (focus lock)
      // ---------------------------
      div.addEventListener('click', () => {
        isPaused = true;
        isLocked = true;

        stopLoop();

        hyper.textContent = person["name-first"];

        clearPosters();
        addFocusedPoster(person.poster);

        closeBtn.style.display = 'block';
      });

      nameList.appendChild(div);
    });

    // ---------------------------
    // close button (unlock)
    // ---------------------------
    closeBtn.style.display = 'none';

    closeBtn.addEventListener('click', () => {
      isLocked = false;
      isPaused = false;

      clearPosters();
      focusedPoster = null; 
      closeBtn.style.display = 'none';

      updateHyper();
      startLoop();
    });

    // ---------------------------
    // start
    // ---------------------------
    setTimeout(() => {
      updateHyper();
      startLoop();
    }, 3000);

  })
  .catch(err => console.error(err));





// =============================================================================
// Gallery
// =============================================================================

const bluetonePath = "./gallery_bluetone/";
const originalPath = "./gallery_original/";

const fileNames = [
  "page1.jpg", 
  "page2.jpg", 
  "page3.jpg",
  "page1.jpg", 
  "page2.jpg", 
  "page3.jpg",
  "page1.jpg", 
  "page2.jpg", 
  "page3.jpg",
  "page1.jpg", 
  "page2.jpg", 
  "page3.jpg",
  "page1.jpg", 
  "page2.jpg", 
  "page3.jpg",
];

const images = fileNames.map(file => [
  bluetonePath + file,
  originalPath + file
]);

const itemsPerPage = 10;

let currentPage = 0;
let activeIndex = 0;
let hoverIndex = null;

const gallery = document.getElementById("page-gallery");
const pagination = document.getElementById("pagination");

// ---------------- BACKGROUND ----------------
function renderBackground() {
  const index = hoverIndex !== null ? hoverIndex : activeIndex;

  if (!images[index]) return;

  const img = images[index][hoverIndex !== null ? 1 : 0];

  gallery.style.backgroundImage = `url('${img}')`;
  gallery.style.backgroundSize = "cover";
  gallery.style.backgroundPosition = "center";
}

// ---------------- RENDER ----------------
function renderPagination() {
  pagination.innerHTML = "";

  const start = currentPage * itemsPerPage;
  const end = start + itemsPerPage;

  const pageItems = images.slice(start, end);

  // PREV
  if (currentPage > 0) {
    const prev = document.createElement("button");
    prev.textContent = "<";
    prev.addEventListener("click", () => {
      currentPage--;
      renderPagination();
    });
    pagination.appendChild(prev);
  }

  // DOTS
  pageItems.forEach((_, i) => {
    const index = start + i;

    const btn = document.createElement("button");
    btn.textContent = "⬤";
    btn.classList.add("dot");

    if (index === activeIndex) {
      btn.classList.add("active");
    }

    // hover → second image
    btn.addEventListener("mouseenter", () => {
      hoverIndex = index;
      renderBackground();
    });

    btn.addEventListener("mouseleave", () => {
      hoverIndex = null;
      renderBackground();
    });

    // click → lock selection
    btn.addEventListener("click", () => {
      activeIndex = index;
      hoverIndex = null;

      renderBackground();
      renderPagination();
    });

    pagination.appendChild(btn);
  });

  // NEXT
  if (end < images.length) {
    const next = document.createElement("button");
    next.textContent = ">";
    next.addEventListener("click", () => {
      currentPage++;
      renderPagination();
    });
    pagination.appendChild(next);
  }
}

// ---------------- INIT ----------------
renderPagination();

// default background
gallery.style.backgroundImage = `url('${images[0][0]}')`;






// =============================================================================
// Floating
// =============================================================================
const floats = ["./icon/joint_1.svg", "./icon/joint_2.svg"];

const objects = [];
const count = 2;

const MIN_DISTANCE = 300; 

// ---------------- HELPER: distance check ----------------
function getDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// ---------------- CREATE OBJECTS ----------------
for (let i = 0; i < count; i++) {
  const img = document.createElement("img");
  img.classList.add("floating");

  const size = 120 + Math.random() * 120;
  img.style.setProperty("--size", `${size}px`);

  img.src = floats[Math.floor(Math.random() * floats.length)];
  document.body.appendChild(img);

  let x, y;

  // ---------------- SPREAD POSITION (avoid overlap) ----------------
  let safe = false;

  while (!safe) {
    x = Math.random() * (window.innerWidth - size);
    y = Math.random() * (window.innerHeight - size);

    safe = true;

    for (const o of objects) {
      if (getDistance({ x, y }, o) < MIN_DISTANCE) {
        safe = false;
        break;
      }
    }
  }

  objects.push({
    el: img,
    x,
    y,
    vx: (Math.random() - 0.5) * 3,
    vy: (Math.random() - 0.5) * 3,
    size,
    angle: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 2,
    swapTimer: 60 + Math.random() * 120
  });
}

// ---------------- ANIMATE ----------------
function animate() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  objects.forEach(o => {
    o.x += o.vx;
    o.y += o.vy;

    // ---------------- BOUNDARY ----------------
    if (o.x <= 0) {
      o.x = 0;
      o.vx *= -1;
    }
    if (o.x + o.size >= w) {
      o.x = w - o.size;
      o.vx *= -1;
    }

    if (o.y <= 0) {
      o.y = 0;
      o.vy *= -1;
    }
    if (o.y + o.size >= h) {
      o.y = h - o.size;
      o.vy *= -1;
    }

    // ---------------- ROTATION ----------------
    o.angle += o.rotSpeed;

    // ---------------- IMAGE SWAP ----------------
    o.swapTimer--;
    if (o.swapTimer <= 0) {
      o.el.src = floats[Math.floor(Math.random() * floats.length)];
      o.swapTimer = 60 + Math.random() * 180;
    }

    o.el.style.transform =
      `translate(${o.x}px, ${o.y}px) rotate(${o.angle}deg)`;
  });

  requestAnimationFrame(animate);
}

animate();



// =============================================================================
// Window Resize
// =============================================================================
window.addEventListener('resize', () => {
  if (!focusedPoster) return;

  const rect = stage.getBoundingClientRect();

  const cx = rect.width / 2;
  const cy = rect.height / 2;

  focusedPoster.style.left = cx + 'px';
  focusedPoster.style.top = cy + 'px';

  focusedPoster.style.transform = `translate(-50%, -50%)`;
});