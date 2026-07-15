
    import * as THREE from 'three';
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
    import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

    const canvas = document.getElementById('helmetCanvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.setClearColor(0xe0deda, 1);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 3);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xc4a882, 1.2);
    dirLight2.position.set(-3, 2, -2);
    scene.add(dirLight2);

    const dirLight3 = new THREE.DirectionalLight(0x8899bb, 0.8);
    dirLight3.position.set(0, -3, 4);
    scene.add(dirLight3);

    const HDRI_LIGHT = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/citrus_orchard_road_puresky_1k.hdr';
    const HDRI_DARK = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/qwantani_dusk_2_1k.hdr';
    const hdriCache = {};

    function loadHDRI(url) {
      return new Promise((resolve) => {
        if (hdriCache[url]) { resolve(hdriCache[url]); return; }
        new RGBELoader().load(url, (texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          hdriCache[url] = texture;
          resolve(texture);
        });
      });
    }

    loadHDRI(HDRI_LIGHT).then((texture) => {
      scene.environment = texture;
    });

    loadHDRI(HDRI_DARK);

    let isDark = false;
    const BG_LIGHT = 0xe0deda;
    const BG_DARK = 0x141414;

    document.getElementById('modeToggle').addEventListener('click', async () => {
      isDark = !isDark;
      document.body.classList.toggle('dark-mode', isDark);

      const hdri = await loadHDRI(isDark ? HDRI_DARK : HDRI_LIGHT);
      scene.environment = hdri;
      renderer.setClearColor(isDark ? BG_DARK : BG_LIGHT, 1);
      renderer.toneMappingExposure = isDark ? 1.2 : 1.0;
    });

    let helmet = null;

    const loader = new GLTFLoader();
    loader.load('https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf', (gltf) => {
      helmet = gltf.scene;
      helmet.scale.set(1.2, 1.2, 1.2);
      scene.add(helmet);
    });

    const sections = [
      { scrollStart: 0, scrollEnd: 0.15, posX: 0.5, posY: 0, rotX: 0, rotY: 0, rotZ: 0, camZ: 3, scale: 1.2 },
      { scrollStart: 0.15, scrollEnd: 0.35, posX: 1.5, posY: 0, rotX: 0.2, rotY: 0.8, rotZ: 0.1, camZ: 2.6, scale: 1.3 },
      { scrollStart: 0.35, scrollEnd: 0.55, posX: -1.0, posY: 0, rotX: -0.1, rotY: 2.2, rotZ: -0.05, camZ: 2.4, scale: 1.35 },
      { scrollStart: 0.55, scrollEnd: 0.7, posX: 0, posY: 0, rotX: 0, rotY: Math.PI, rotZ: 0, camZ: 3, scale: 1.1 },
      { scrollStart: 0.7, scrollEnd: 0.85, posX: 0.8, posY: -0.1, rotX: 0.3, rotY: 4.5, rotZ: 0.15, camZ: 2.2, scale: 1.4 },
      { scrollStart: 0.85, scrollEnd: 1.0, posX: -0.8, posY: 0, rotX: -0.15, rotY: Math.PI * 2, rotZ: 0.1, camZ: 2.8, scale: 1.2 },
    ];

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function smoothstep(a, b, t) {
      const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
      return x * x * (3 - 2 * x);
    }

    let scrollProgress = 0;
    let targetScrollProgress = 0;

    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let orbitX = 0; 
    let orbitY = 0;
    let targetOrbitX = 0;
    let targetOrbitY = 0;
    const DRAG_SENSITIVITY = 0.006;
    const ORBIT_DECAY = 0.03; 

    window.addEventListener('pointerdown', (e) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      targetOrbitX = dx * DRAG_SENSITIVITY;
      targetOrbitY = dy * DRAG_SENSITIVITY;
    });

    window.addEventListener('pointerup', () => {
      if (isDragging) {
        isDragging = false;
        dragStartX = 0;
        dragStartY = 0;
      }
    });

    window.addEventListener('scroll', () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      targetScrollProgress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
    });

    const fadeEls = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15 });
    fadeEls.forEach(el => observer.observe(el));

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
      requestAnimationFrame(animate);

      scrollProgress += (targetScrollProgress - scrollProgress) * 0.06;

      if (helmet) {
        let currentSection = sections[0];
        let nextSection = sections[1] || sections[0];
        let localT = 0;

        for (let i = 0; i < sections.length; i++) {
          if (scrollProgress >= sections[i].scrollStart && scrollProgress <= sections[i].scrollEnd) {
            currentSection = sections[i];
            nextSection = sections[Math.min(i + 1, sections.length - 1)];
            localT = smoothstep(currentSection.scrollStart, currentSection.scrollEnd, scrollProgress);
            break;
          }
          if (i === sections.length - 1) {
            currentSection = sections[i];
            nextSection = sections[i];
            localT = 1;
          }
        }

        const posX = lerp(currentSection.posX, nextSection.posX, localT);
        const posY = lerp(currentSection.posY, nextSection.posY, localT);
        const rotX = lerp(currentSection.rotX, nextSection.rotX, localT);
        const rotY = lerp(currentSection.rotY, nextSection.rotY, localT);
        const rotZ = lerp(currentSection.rotZ, nextSection.rotZ, localT);
        const camZ = lerp(currentSection.camZ, nextSection.camZ, localT);
        const scale = lerp(currentSection.scale, nextSection.scale, localT);

        if (isDragging) {
          orbitX += (targetOrbitX - orbitX) * 0.12;
          orbitY += (targetOrbitY - orbitY) * 0.12;
        } else {
          orbitX += (0 - orbitX) * ORBIT_DECAY;
          orbitY += (0 - orbitY) * ORBIT_DECAY;
          targetOrbitX += (0 - targetOrbitX) * ORBIT_DECAY;
          targetOrbitY += (0 - targetOrbitY) * ORBIT_DECAY;
        }

        helmet.position.x = posX;
        helmet.position.y = posY;
        helmet.rotation.x = rotX + orbitY;
        helmet.rotation.y = rotY + Math.sin(Date.now() * 0.0003) * 0.05 + orbitX;
        helmet.rotation.z = rotZ;
        helmet.scale.setScalar(scale);

        camera.position.z = camZ;
      }

      renderer.render(scene, camera);
    }

    animate();

    setTimeout(() => {
      document.querySelector('.hero .fade-in')?.classList.add('visible');
    }, 300);