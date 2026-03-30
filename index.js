
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

function focusIndex(index, total) {
  const step = (Math.PI * 2) / total;

  targetRotation = -index * step;
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
  img.style.top = y + 'px';

  img.style.transform = `translate(-50%, -50%)`;
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

    function updateHyper() {
      if (isPaused || isLocked) return;

      const person = data[currentIndex];

      hyper.textContent = person["name-first"];
      hyper.style.color = "var(--color-r)";

      currentIndex = (currentIndex + 1) % data.length;

      focusIndex(currentIndex, data.length);
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

      div.innerHTML = `
        <span>${person["name-first"]}</span>
        <span>${person["name-last"]}</span>
      `;

      div.addEventListener('mouseenter', () => {
        if (isLocked) return;

        isPaused = true;
        stopLoop();

        hyper.textContent = person["name-first"];
        
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

        focusIndex(i, data.length);
      });

      div.addEventListener('mouseleave', () => {
        if (isLocked) return;

        isPaused = false;
        startLoop();
      });

      div.addEventListener('click', () => {
        isLocked = true;
        isPaused = true;

        stopLoop();

        hyper.textContent = person["name-first"];
        focusIndex(i, data.length);
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
    }, 1500);

  });


// =============================================================================
// Gallery (UNCHANGED)
// =============================================================================

const bluetonePath = "./gallery_bluetone/";
const originalPath = "./gallery_original/";

const fileNames = [
  "page1.jpg","page2.jpg","page3.jpg"
];

const images = fileNames.map(file => [
  bluetonePath + file,
  originalPath + file
]);

let currentPage = 0;
let activeIndex = 0;
let hoverIndex = null;

const gallery = document.getElementById("page-gallery");
const pagination = document.getElementById("pagination");

function renderBackground() {
  const index = hoverIndex !== null ? hoverIndex : activeIndex;
  if (!images[index]) return;

  const img = images[index][hoverIndex !== null ? 1 : 0];
  gallery.style.backgroundImage = `url('${img}')`;
}

function renderPagination() {
  pagination.innerHTML = "";

  images.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.textContent = "⬤";

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
  });
}

renderPagination();
gallery.style.backgroundImage = `url('${images[0][0]}')`;


// =============================================================================
// Floating (UNCHANGED)
// =============================================================================

const floats = ["./icon/joint_1.svg", "./icon/joint_2.svg"];

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
  if (!focusedPoster) return;

  const rect = stage.getBoundingClientRect();

  const cx = rect.width / 2;
  const cy = rect.height / 2;

  focusedPoster.style.left = cx + 'px';
  focusedPoster.style.top = cy + 'px';

  focusedPoster.style.transform = `translate(-50%, -50%)`;
});