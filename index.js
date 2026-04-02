
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

//new
const eggFloatingLayer = document.querySelector('.egg-floating-layer');

const eggFloatSources = [
  "./icon/joint_1.svg",
  "./icon/joint_2.svg"
];

const eggFloatItems = [];

function createEggFloating() {
  if (!eggFloatingLayer || eggFloatItems.length) return;

  const positions = [
    { top: "18px", left: "40px" },
    { bottom: "12px", right: "36px" }
  ];

  positions.forEach((pos, i) => {
    const img = document.createElement("img");
    img.classList.add("egg-floating");
    img.src = eggFloatSources[i % eggFloatSources.length];

    Object.assign(img.style, pos);

    eggFloatingLayer.appendChild(img);

    eggFloatItems.push({
      el: img,
      angle: Math.random() * 360,
      rotSpeed: i === 0 ? 0.25 : -0.35
    });
  });
}

function animateEggFloating() {
  eggFloatItems.forEach(item => {
    item.angle += item.rotSpeed;
    item.el.style.transform = `rotate(${item.angle}deg)`;
  });

  requestAnimationFrame(animateEggFloating);
}

createEggFloating();
animateEggFloating();


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
// THREE.JS CYLINDER CAROUSEL SYSTEM
// =============================================================================
let scene, camera, renderer;
let posters = [];

const stage = document.getElementById('poster-stage');

const RADIUS = 6.8;

let targetRotation = 0;
let currentRotation = 0;
let currentIndex = 0;
let focusedPoster = null;

let introPoster = null;
let hasStarted = false;

initThree();

function initThree() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    50,
    stage.clientWidth / stage.clientHeight,
    0.1,
    1000
  );

  camera.position.z = 11;

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });

  renderer.setSize(stage.clientWidth, stage.clientHeight);
  stage.appendChild(renderer.domElement);

  animate();
}


// =============================================================================
// CYLINDER POSITIONING
// =============================================================================

function getCylinderPosition(index, total) {
  const angle = (index / total) * Math.PI * 2;

  return {
    x: Math.sin(angle) * RADIUS,
    z: Math.cos(angle) * RADIUS,
    angle
  };
}


// =============================================================================
// POSTER CREATION
// =============================================================================

function createPoster(texture, index, total) {
  const img = texture.image;

  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1;
  texture.offset.x = 1;

  const aspect = img.width / img.height;

  const height = 3;
  const width = height * aspect;

  const geometry = new THREE.PlaneGeometry(width, height);

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geometry, material);

  const pos = getCylinderPosition(index, total);

  mesh.position.set(pos.x, 0, pos.z);
  mesh.lookAt(0, 0, 0);

  mesh.userData = {
    index,
    angle: pos.angle,
    src: texture.image?.currentSrc || texture.image?.src
  };

  scene.add(mesh);
  posters.push(mesh);
}


// =============================================================================
// BUILD POSTERS
// =============================================================================

function addPosterSet(list) {
  const loader = new THREE.TextureLoader();

  list.forEach((src, i) => {
    loader.load(src, (texture) => {
      createPoster(texture, i, list.length);
    });
  });
}


// =============================================================================
// ROTATION CONTROL
// =============================================================================

// function focusIndex(index, total) {
//   const step = (Math.PI * 2) / total;

//   targetRotation = -index * step;
//   currentIndex = index;
// }

function focusIndex(index, total, mode = "auto") {
  const step = (Math.PI * 2) / total;

  if (mode === "auto") {
    targetRotation -= step;
  } else {
    const desired = -index * step;
    let diff = desired - targetRotation;

    diff = Math.atan2(Math.sin(diff), Math.cos(diff));

    targetRotation += diff;
  }

  currentIndex = index;
}

// =============================================================================
// ANIMATION LOOP
// =============================================================================

function animate() {
  requestAnimationFrame(animate);

  currentRotation += (targetRotation - currentRotation) * 0.04;

  posters.forEach(p => {
    const a = p.userData.angle + currentRotation;

    p.position.x = Math.sin(a) * RADIUS;
    p.position.z = Math.cos(a) * RADIUS;

    p.lookAt(0, 0, 0);
  });

  renderer.render(scene, camera);
}


// =============================================================================
// RESIZE
// =============================================================================

window.addEventListener('resize', () => {
  camera.aspect = stage.clientWidth / stage.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(stage.clientWidth, stage.clientHeight);
});


// =============================================================================
// FOCUSED POSTER (2D OVERLAY SYSTEM)
// =============================================================================

function getCenterPosition() {
  return {
    x: stage.clientWidth / 2,
    y: stage.clientHeight / 2
  };
}

const mainStage = document.getElementById('poster-main');

function addFocusedPoster(src) {
  if (!src) return;

  if (focusedPoster) {
    focusedPoster.remove();
    focusedPoster = null;
  }

  const img = document.createElement('img');
  img.src = src;
  img.className = 'poster';

  const { x, y } = getCenterPosition();

  img.style.left = x + 'px';
  img.style.top = '0';

  img.style.transform = `translate(-50%, 0)`;
  img.style.width = "75%";
  img.style.maxWidth = "none";

  mainStage.appendChild(img);

  focusedPoster = img;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      img.classList.add('show');
    });
  });
}


// =============================================================================
// INTERACTION SYSTEM
// =============================================================================

const nameList = document.getElementById('name-list');
const hyper = document.getElementById('hyper');
const closeBtn = document.getElementById('closeBtn');

let intervalId = null;
let isPaused = false;
let isLocked = false;

fetch('data.json')
  .then(res => res.json())
  .then(data => {

    const posterList = data.map(d => d.poster);

    addPosterSet(posterList);

    focusIndex(0, data.length, "direct");
    currentRotation = targetRotation;

    addFocusedPoster('./posters/hyper.png');
    introPoster = focusedPoster;

    const website = document.getElementById('website');
    const insta1 = document.getElementById('instagram1');
    const insta2 = document.getElementById('instagram2');

    function hideContacts() {
      website.style.display = 'none';
      insta1.style.display = 'none';
      insta2.style.display = 'none';

      website.textContent = '';
      insta1.textContent = '';
      insta2.textContent = '';
    }

    function updateHyper() {
      // if (isPaused || isLocked) return;

      // hideContacts();
      if (isPaused || isLocked) return;

      if (!isPaused && !isLocked) {
        hideContacts();
      }
      
      if (!hasStarted) {
        hasStarted = true;

        if (introPoster) {
          introPoster.remove();
          introPoster = null;
          focusedPoster = null;
        }
      }

      currentIndex = (currentIndex + 1) % data.length;
      const person = data[currentIndex];

      hyper.textContent = person["name-first"];
      hyper.style.color = "var(--color-r)";

      focusIndex(currentIndex, data.length, "auto");
    }

    function startLoop() {
      intervalId = setInterval(updateHyper, 3000);
    }

    function stopLoop() {
      clearInterval(intervalId);
    }

    // =============================================================================
    // NAME LIST
    // =============================================================================
    data.forEach((person, i) => {
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

      div.addEventListener('mouseenter', () => {
        if (isLocked) return;

        isPaused = true;
        stopLoop();

        hyper.textContent = person["name-first"];
        
        // contact
        website.href = person.website ? `https://${person.website}` : '#';
        website.textContent = person.website || '';

        insta1.href = person.instagram1 ? `https://instagram.com/${person.instagram1}` : '#';
        insta1.textContent = person.instagram1 ? `@${person.instagram1}` : '';

        insta2.href = person.instagram2 ? `https://instagram.com/${person.instagram2}` : '#';
        insta2.textContent = person.instagram2 ? `@${person.instagram2}` : '';

        website.style.display = 'inline-block';
        insta1.style.display = 'inline-block';
        insta2.style.display = 'inline-block';

        // focusIndex(i, data.length);
        focusIndex(i, data.length, "direct");
      });

      div.addEventListener('mouseleave', () => {
        if (isLocked) return;

        isPaused = false;
        hideContacts();
        startLoop();
      });

      div.addEventListener('click', () => {
        isLocked = true;
        isPaused = true;

        stopLoop();

        hyper.textContent = person["name-first"];
        // focusIndex(i, data.length);
        focusIndex(i, data.length, "direct");
        addFocusedPoster(person.poster);
        closeBtn.style.display = 'block';
      });

      nameList.appendChild(div);
    });

    closeBtn.addEventListener('click', () => {
      isLocked = false;
      isPaused = false;

      // remove focused poster
      if (focusedPoster) {
        focusedPoster.remove();
        focusedPoster = null;
      }

      closeBtn.style.display = 'none';

      startLoop();
    });

    setTimeout(() => {
      updateHyper();
      startLoop();
    }, 500);

  });


// =============================================================================
// Gallery (UNCHANGED)
// =============================================================================
const bluetonePath = "./gallery_bluetone/";
const originalPath = "./gallery_original/";
const mobilePath = "./gallery_mobile/";

// =============================================================================
// ✅ Gallery Images Here!!! 
// =============================================================================
const fileNames = [
  "page1.jpg",
  "page2.jpg",
  "page3.jpg",
  "page4.jpg",
  "page5.jpg",
  "page6.jpg",
  "page7.jpg",
  "page8.jpg",
  "page9.jpg",
  "page10.jpg",
  
];
// =============================================================================


const isMobile = window.matchMedia("(max-width: 600px)").matches;
const images = fileNames.map(file =>
  isMobile
    ? [mobilePath + file]
    : [bluetonePath + file, originalPath + file]
);

let activeIndex = 0;
let hoverIndex = null;

let pageGroup = 0;
const PAGE_SIZE = 7;

const gallery = document.getElementById("page-gallery");
const pagination = document.getElementById("pagination");

// =============================================================================
// background
// =============================================================================
function renderBackground() {
  const index = hoverIndex !== null ? hoverIndex : activeIndex;
  if (!images[index]) return;

  const img =
    isMobile
      ? images[index][0]
      : images[index][hoverIndex !== null ? 1 : 0];

  gallery.style.backgroundImage = `url('${img}')`;
}

// =============================================================================
// pagination
// =============================================================================
function renderPagination() {
  pagination.innerHTML = "";

  const totalPages = images.length;
  const start = pageGroup * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, totalPages);

  // ---------------- previous button ----------------
  if (pageGroup > 0) {
    const prevBtn = document.createElement("button");
    prevBtn.classList.add("material-symbols-outlined");
    prevBtn.textContent = "arrow_back_ios";
    prevBtn.style.fontVariationSettings = "'FILL' 1, 'wght' 700, 'GRAD' 200,'opsz' 20";

    // const galleryArrows = pageGallery.querySelectorAll(".gallery-arrow"); //----setting up removal of gallery arrows
    // galleryArrows.forEach(btn => btn.remove()); //----removal of gallery arrows

    prevBtn.onclick = () => {
      pageGroup--;
      renderPagination();
    };

    pagination.appendChild(prevBtn);
  }

//   // ---------------- prev & next image button ----------------
//   function createGalleryArrow(direction) {
//     const isPrev = direction === "prev";
//     if (isPrev ? activeIndex <= 0 : activeIndex >= images.length - 1) return;

//     const btn = document.createElement("button");
//     btn.classList.add("material-symbols-outlined", "gallery-arrow");
//     btn.textContent = isPrev ? "arrow_back_ios" : "arrow_forward_ios";
//     btn.style.fontVariationSettings = "'FILL' 1, 'wght' 700, 'GRAD' 200,'opsz' 20";
//     btn.style.position = "absolute";
//     btn.style[isPrev ? "left" : "right"] = "10px";
//     btn.style.top = "50%";
//     btn.style.transform = "translateY(-50%)";

//     btn.onclick = () => {
//       activeIndex += isPrev ? -1 : 1;
//       const newGroup = Math.floor(activeIndex / PAGE_SIZE);
//       if (newGroup !== pageGroup) {
//         pageGroup = newGroup;
//       }
//       renderPagination();
//       renderBackground();
//     };

//     pageGallery.appendChild(btn);
//   }
//   createGalleryArrow("prev");
//   createGalleryArrow("next");

  // ---------------- page dots ----------------
  for (let i = start; i < end; i++) {
    const btn = document.createElement("button");
    btn.classList.add("material-symbols-outlined");
    btn.textContent = "circle";

    if (i === activeIndex) {
      btn.style.color = "var(--color-r)";
    } else {
      btn.style.color = "";
    }

    btn.onmouseenter = () => {
      hoverIndex = i;
      renderBackground();
    };

    btn.onmouseleave = () => {
      hoverIndex = null;
      renderBackground();
    };

    btn.onclick = () => {
      activeIndex = i;
      renderPagination();
      renderBackground();
    };

    pagination.appendChild(btn);
  }

  // ---------------- next button ----------------
  if (end < totalPages) {
    const nextBtn = document.createElement("button");
    nextBtn.classList.add("material-symbols-outlined");
    nextBtn.textContent = "arrow_forward_ios";
    nextBtn.style.fontVariationSettings = "'FILL' 1, 'wght' 700, 'GRAD' 200,'opsz' 20";


    nextBtn.onclick = () => {
      pageGroup++;
      renderPagination();
    };

    pagination.appendChild(nextBtn);
  }
}

renderPagination();
gallery.style.backgroundImage = `url('${images[0][0]}')`;


// =============================================================================
// Floating (UNCHANGED)
// =============================================================================

const floats = [
  "./icon/joint_1.svg", 
  "./icon/joint_2.svg"
];

const objects = [];
const count = 2;

function getDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

for (let i = 0; i < count; i++) {
  const img = document.createElement("img");
  img.classList.add("floating");

  document.body.appendChild(img);

  const size = 120 + Math.random() * 120;
  img.style.setProperty("--size", `${size}px`);

  img.src = floats[Math.floor(Math.random() * floats.length)];

  let x, y, safe = false;

  while (!safe) {
    x = Math.random() * window.innerWidth;
    y = Math.random() * window.innerHeight;

    safe = objects.every(o => getDistance({ x, y }, o) > 300);
  }

  objects.push({
    el: img,
    x, y,
    vx: (Math.random() - 0.5) * 3,
    vy: (Math.random() - 0.5) * 3,
    size,
    angle: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 2,
    swapTimer: 120
  });
}

function animateFloating() {
  objects.forEach(o => {
    o.x += o.vx;
    o.y += o.vy;

    if (o.x < 0 || o.x > window.innerWidth) o.vx *= -1;
    if (o.y < 0 || o.y > window.innerHeight) o.vy *= -1;

    o.angle += o.rotSpeed;

    o.el.style.transform =
      `translate(${o.x}px, ${o.y}px) rotate(${o.angle}deg)`;
  });

  requestAnimationFrame(animateFloating);
}

animateFloating();


// =============================================================================
// Window Resize
// =============================================================================
window.addEventListener('resize', () => {
  location.reload();
  
  if (!focusedPoster) return;

  const rect = stage.getBoundingClientRect();

  const cx = rect.width / 2;
  const cy = rect.height / 2;

  focusedPoster.style.left = cx + 'px';
  focusedPoster.style.top = cy + 'px';

  focusedPoster.style.transform = `translate(-50%, -50%)`;
});


// =============================================================================
// Mobile Zoom Prevented
// =============================================================================
document.addEventListener("gesturestart", function (e) {
  e.preventDefault();
});

document.addEventListener("dblclick", function (e) {
  e.preventDefault();
});