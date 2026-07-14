import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        const container = document.getElementById('three-container');
        const morphNameEl = document.getElementById('morph-name');
        const morphCounterEl = document.getElementById('morph-counter');
        const dots = document.querySelectorAll('.dot-nav');

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 2.5;
        renderer.powerPreference = 'high-performance';
        container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0e0e0e);
        scene.fog = new THREE.FogExp2(0x0e0e0e, 0.02);

        const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 0, 5);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.04;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.4;
        controls.enableZoom = false;
        controls.enablePan = false;

        const ambient = new THREE.AmbientLight(0xffeedd, 3);
        scene.add(ambient);

        const keyLight = new THREE.PointLight(0xc4a882, 15, 50);
        keyLight.position.set(3, 3, 4);
        scene.add(keyLight);

        const fillLight = new THREE.PointLight(0x4a6fa5, 8, 50);
        fillLight.position.set(-4, -2, 3);
        scene.add(fillLight);

        const rimLight = new THREE.PointLight(0x8b7355, 10, 50);
        rimLight.position.set(0, 4, -3);
        scene.add(rimLight);

        const frontLight = new THREE.PointLight(0xffffff, 12, 40);
        frontLight.position.set(0, 0, 6);
        scene.add(frontLight);

        const bottomLight = new THREE.PointLight(0xc4a882, 8, 40);
        bottomLight.position.set(0, -3, 3);
        scene.add(bottomLight);

        
        const PARTICLE_COUNT = 25000;
        const shapes = [];
        const shapeNames = ['Dodeca', 'Heart', 'Diamond', 'Helix'];

        
        function sampleGeometry(geometry, count) {
            const pos = new Float32Array(count * 3);
            const posAttr = geometry.attributes.position;
            const indexAttr = geometry.index;
            
            const triangles = [];
            const triCount = indexAttr ? indexAttr.count / 3 : posAttr.count / 3;
            const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vC = new THREE.Vector3();
            const areas = [];
            let totalArea = 0;

            for (let i = 0; i < triCount; i++) {
                let a, b, c;
                if (indexAttr) {
                    a = indexAttr.getX(i * 3);
                    b = indexAttr.getX(i * 3 + 1);
                    c = indexAttr.getX(i * 3 + 2);
                } else {
                    a = i * 3; b = i * 3 + 1; c = i * 3 + 2;
                }
                vA.fromBufferAttribute(posAttr, a);
                vB.fromBufferAttribute(posAttr, b);
                vC.fromBufferAttribute(posAttr, c);
                const area = new THREE.Triangle(vA.clone(), vB.clone(), vC.clone()).getArea();
                areas.push(area);
                totalArea += area;
                triangles.push([vA.clone(), vB.clone(), vC.clone()]);
            }

            for (let i = 0; i < count; i++) {
                let r = Math.random() * totalArea;
                let triIdx = 0;
                for (let j = 0; j < areas.length; j++) {
                    r -= areas[j];
                    if (r <= 0) { triIdx = j; break; }
                }
                const tri = triangles[triIdx];
                let u = Math.random(), v = Math.random();
                if (u + v > 1) { u = 1 - u; v = 1 - v; }
                const w = 1 - u - v;
                pos[i * 3]     = tri[0].x * w + tri[1].x * u + tri[2].x * v;
                pos[i * 3 + 1] = tri[0].y * w + tri[1].y * u + tri[2].y * v;
                pos[i * 3 + 2] = tri[0].z * w + tri[1].z * u + tri[2].z * v;
            }
            return pos;
        }

        function makeSkull() {
            const geo = new THREE.DodecahedronGeometry(1.2, 1);
            const nonIdx = geo.toNonIndexed();
            const idxGeo = new THREE.BufferGeometry();
            idxGeo.setAttribute('position', nonIdx.attributes.position);
            const idxArr = [];
            for (let i = 0; i < nonIdx.attributes.position.count; i++) idxArr.push(i);
            idxGeo.setIndex(idxArr);
            return sampleGeometry(idxGeo, PARTICLE_COUNT);
        }

        function makeHeart() {
            const pos = new Float32Array(PARTICLE_COUNT * 3);
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const t = Math.random() * Math.PI * 2;
                const s = Math.random() * Math.PI;
                const scatter = 0.03;
                const x = 1.2 * Math.sin(t) * Math.sin(s);
                let y = 0.8 * Math.cos(s) + 0.4 * Math.cos(t) * Math.sin(s);
                const z = 1.0 * Math.sin(t) * Math.cos(s) * (1 + 0.3 * Math.sin(t));
                
                const heartX = 16 * Math.pow(Math.sin(t), 3) / 16;
                const heartY = (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) / 16;
                const depth = Math.sin(s) * 0.5;

                pos[i * 3]     = heartX + (Math.random() - 0.5) * scatter;
                pos[i * 3 + 1] = heartY + (Math.random() - 0.5) * scatter;
                pos[i * 3 + 2] = depth + (Math.random() - 0.5) * scatter;
            }
            return pos;
        }

        function makeDiamond() {
            const yOffset = 0.35;
            const topGeo = new THREE.ConeGeometry(1.4, 0.9, 8);
            topGeo.translate(0, 0.45 + yOffset, 0);
            const bottomGeo = new THREE.ConeGeometry(1.4, 2.0, 8);
            bottomGeo.rotateX(Math.PI);
            bottomGeo.translate(0, -1.0 + yOffset, 0);

            const topNonIdx = topGeo.toNonIndexed();
            const botNonIdx = bottomGeo.toNonIndexed();
            const topIdxGeo = new THREE.BufferGeometry();
            topIdxGeo.setAttribute('position', topNonIdx.attributes.position);
            const topIdx = []; for (let i = 0; i < topNonIdx.attributes.position.count; i++) topIdx.push(i);
            topIdxGeo.setIndex(topIdx);

            const botIdxGeo = new THREE.BufferGeometry();
            botIdxGeo.setAttribute('position', botNonIdx.attributes.position);
            const botIdx = []; for (let i = 0; i < botNonIdx.attributes.position.count; i++) botIdx.push(i);
            botIdxGeo.setIndex(botIdx);

            const topCount = Math.floor(PARTICLE_COUNT * 0.4);
            const botCount = PARTICLE_COUNT - topCount;
            const topPts = sampleGeometry(topIdxGeo, topCount);
            const botPts = sampleGeometry(botIdxGeo, botCount);

            const pos = new Float32Array(PARTICLE_COUNT * 3);
            pos.set(topPts);
            for (let i = 0; i < botCount * 3; i++) {
                pos[topCount * 3 + i] = botPts[i];
            }
            return pos;
        }

        function makeHelix() {
            const pos = new Float32Array(PARTICLE_COUNT * 3);
            const helixCount = PARTICLE_COUNT / 2;
            for (let h = 0; h < 2; h++) {
                const offset = h * Math.PI;
                for (let i = 0; i < helixCount; i++) {
                    const idx = (h * helixCount + i) * 3;
                    const t = (i / helixCount) * Math.PI * 6 - Math.PI * 3;
                    const r = 0.6;
                    pos[idx]     = r * Math.cos(t + offset) + (Math.random() - 0.5) * 0.04;
                    pos[idx + 1] = t * 0.25 + (Math.random() - 0.5) * 0.04;
                    pos[idx + 2] = r * Math.sin(t + offset) + (Math.random() - 0.5) * 0.04;

                    if (i % 200 < 10 && h === 0) {
                        const rungT = Math.floor(i / 200) * 200;
                        const rungAngle = (rungT / helixCount) * Math.PI * 6 - Math.PI * 3;
                        const frac = (i % 200) / 10;
                        pos[idx]     = r * Math.cos(rungAngle) * (1 - frac) + r * Math.cos(rungAngle + Math.PI) * frac;
                        pos[idx + 2] = r * Math.sin(rungAngle) * (1 - frac) + r * Math.sin(rungAngle + Math.PI) * frac;
                    }
                }
            }
            return pos;
        }

        shapes.push(makeSkull());
        shapes.push(makeHeart());
        shapes.push(makeDiamond());
        shapes.push(makeHelix());

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const colors = new Float32Array(PARTICLE_COUNT * 3);
        const sizes = new Float32Array(PARTICLE_COUNT);
        const randoms = new Float32Array(PARTICLE_COUNT);

        positions.set(shapes[0]);

        const c1 = new THREE.Color(0xf0d9b5);
        const c2 = new THREE.Color(0xd4a574);
        const c3 = new THREE.Color(0x7eb8e0);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const ratio = i / PARTICLE_COUNT;
            const color = ratio < 0.5 
                ? c1.clone().lerp(c2, ratio * 2)
                : c2.clone().lerp(c3, (ratio - 0.5) * 2);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
            sizes[i] = 0.012 + Math.random() * 0.02;
            randoms[i] = Math.random();
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: renderer.getPixelRatio() },
                uMorph: { value: 0 },
                uMouse3D: { value: new THREE.Vector3(0, 0, 0) },
                uMouseActive: { value: 0 },
            },
            vertexShader: `
                attribute float aSize;
                attribute float aRandom;
                varying vec3 vColor;
                varying float vAlpha;
                uniform float uTime;
                uniform float uPixelRatio;
                uniform float uMorph;

                uniform vec3 uMouse3D;
                uniform float uMouseActive;

                void main() {
                    vColor = color;
                    vec3 pos = position;
                    
                    float breath = sin(uTime * 0.5 + aRandom * 6.28) * 0.02;
                    pos += normalize(pos) * breath;
                    
                    float scatter = sin(uMorph * 3.14159) * 0.3;
                    pos += normalize(pos + vec3(0.001)) * scatter * aRandom;

                    vec3 toParticle = pos - uMouse3D;
                    float xyDist = length(toParticle.xy);
                    float fullDist = length(toParticle);
                    float mouseRadius = 1.4;
                    float influence = 1.0 - smoothstep(0.0, mouseRadius, xyDist);
                    influence = influence * influence * uMouseActive;
                    
                    if (influence > 0.001) {
                        vec3 pushDir = fullDist > 0.001 ? normalize(toParticle) : vec3(0.0, 1.0, 0.0);
                        float pushStrength = influence * 0.3;
                        pos += pushDir * pushStrength;
                        
                        float swirlSpeed = uTime * 2.0 + aRandom * 6.28;
                        float swirlStrength = influence * 0.25;
                        vec2 radial = pos.xy - uMouse3D.xy;
                        float angle = swirlStrength * (1.0 + sin(swirlSpeed) * 0.3);
                        float cosA = cos(angle);
                        float sinA = sin(angle);
                        vec2 rotated = vec2(
                            radial.x * cosA - radial.y * sinA,
                            radial.x * sinA + radial.y * cosA
                        );
                        pos.xy = uMouse3D.xy + rotated;
                        
                        pos.z += sin(swirlSpeed * 0.7 + aRandom * 3.14) * influence * 0.15;
                        
                        float jitter = sin(uTime * 4.0 + aRandom * 18.0) * 0.02 * influence;
                        pos += pushDir * jitter;
                    }

                    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = aSize * uPixelRatio * 500.0 / -mvPos.z;
                    gl_PointSize = max(gl_PointSize, 1.5);
                    gl_Position = projectionMatrix * mvPos;
                    
                    vAlpha = 0.85 + 0.15 * (1.0 - smoothstep(0.0, 10.0, -mvPos.z));
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    float d = length(gl_PointCoord - vec2(0.5));
                    if (d > 0.5) discard;
                    float alpha = smoothstep(0.5, 0.0, d) * vAlpha;
                    vec3 brightColor = vColor * 2.2 + 0.15;
                    gl_FragColor = vec4(brightColor, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        let currentShape = 0;
        let targetShape = 0;
        let morphProgress = 0;
        let isMorphing = false;
        const morphDuration = 2.5;
        let morphStartTime = 0;
        const clock = new THREE.Clock();

        function startMorph(targetIdx) {
            if (isMorphing || targetIdx === currentShape) return;
            targetShape = targetIdx;
            isMorphing = true;
            morphStartTime = clock.getElapsedTime();

        }

        const morphProgressEl = document.getElementById('morph-progress');
        let morphTimer = 0;
        const morphInterval = 5;

        let autoMorphInterval = setInterval(() => {
            const next = (currentShape + 1) % shapes.length;
            startMorph(next);
        }, 5000);

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const idx = parseInt(dot.dataset.idx);
                clearInterval(autoMorphInterval);
                startMorph(idx);
                autoMorphInterval = setInterval(() => {
                    const next = (currentShape + 1) % shapes.length;
                    startMorph(next);
                }, 5000);
            });
        });

        function updateUI(idx) {
            morphNameEl.textContent = shapeNames[idx];
            morphCounterEl.textContent = `0${idx + 1} / 0${shapes.length}`;
            dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        }

        const raycaster = new THREE.Raycaster();
        const mouseNDC = new THREE.Vector2(9999, 9999);
        const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const mouse3D = new THREE.Vector3();
        let mouseOnScreen = false;
        let mouseActiveSmooth = 0;

        document.addEventListener('mousemove', (e) => {
            mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
            mouseOnScreen = true;
        });

        document.addEventListener('mouseleave', () => {
            mouseNDC.set(9999, 9999);
            mouseOnScreen = false;
        });

        const _invMatrix = new THREE.Matrix4();
        const _localMouse = new THREE.Vector3();
        const _intersectPoint = new THREE.Vector3();

        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        let lastUIUpdate = -1;

        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            const elapsed = clock.getElapsedTime();
            material.uniforms.uTime.value = elapsed;

            const mouseTarget = mouseOnScreen ? 1 : 0;
            mouseActiveSmooth += (mouseTarget - mouseActiveSmooth) * 0.08;
            material.uniforms.uMouseActive.value = mouseActiveSmooth;

            raycaster.setFromCamera(mouseNDC, camera);
            raycaster.ray.intersectPlane(mousePlane, _intersectPoint);
            _invMatrix.copy(particles.matrixWorld).invert();
            _localMouse.copy(_intersectPoint).applyMatrix4(_invMatrix);
            material.uniforms.uMouse3D.value.copy(_localMouse);

            if (isMorphing) {
                const rawProgress = Math.min((elapsed - morphStartTime) / morphDuration, 1);
                morphProgress = easeInOutCubic(rawProgress);
                material.uniforms.uMorph.value = morphProgress;

                const srcPositions = shapes[currentShape];
                const tgtPositions = shapes[targetShape];
                const posArray = geometry.attributes.position.array;
                const len = PARTICLE_COUNT * 3;

                for (let i = 0; i < len; i++) {
                    posArray[i] = srcPositions[i] + (tgtPositions[i] - srcPositions[i]) * morphProgress;
                }
                geometry.attributes.position.needsUpdate = true;

                if (rawProgress >= 1) {
                    isMorphing = false;
                    currentShape = targetShape;
                    material.uniforms.uMorph.value = 0;
                    updateUI(currentShape);
                    lastUIUpdate = -1;
                }

                if (rawProgress > 0.4 && rawProgress < 0.6 && lastUIUpdate !== targetShape) {
                    lastUIUpdate = targetShape;
                    updateUI(targetShape);
                }
            }

            particles.rotation.y = elapsed * 0.06;
            particles.position.y = Math.sin(elapsed * 0.3) * 0.06;

            const sinT = Math.sin(elapsed * 0.2);
            const cosT = Math.cos(elapsed * 0.2);
            keyLight.position.x = sinT * 4;
            keyLight.position.z = cosT * 4;

            if (!isMorphing) {
                const barProgress = ((elapsed % morphInterval) / morphInterval) * 100;
                if (morphProgressEl) morphProgressEl.style.width = barProgress + '%';
            } else {
                if (morphProgressEl) morphProgressEl.style.width = '0%';
            }

            renderer.render(scene, camera);
        }

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
        });

        animate();

        const blurLayer = document.querySelector('.layer-blur');
        let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
        let smoothX = mouseX, smoothY = mouseY;
        let lastBlurX = '', lastBlurY = '';

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateBlur() {
            smoothX += (mouseX - smoothX) * 0.1;
            smoothY += (mouseY - smoothY) * 0.1;
            const newX = (smoothX / window.innerWidth * 100).toFixed(1) + '%';
            const newY = (smoothY / window.innerHeight * 100).toFixed(1) + '%';
            if (newX !== lastBlurX || newY !== lastBlurY) {
                lastBlurX = newX;
                lastBlurY = newY;
                blurLayer.style.setProperty('--x', newX);
                blurLayer.style.setProperty('--y', newY);
            }
            requestAnimationFrame(animateBlur);
        }
        animateBlur();
document.addEventListener('DOMContentLoaded', () => {
    const sliderContainer = document.getElementById('slider');
    const slides = document.querySelectorAll('.slide');
    const dotsWrapper = document.querySelector('.dots-wrapper');
    const prevBtn = document.querySelector('.nav-arrow.prev');
    const nextBtn = document.querySelector('.nav-arrow.next');

    let currentSlide = 0;
    let slideInterval; 

    function startAutoSlide() {
        slideInterval = setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            goToSlide(currentSlide);
        }, 5000); 
    }

    function resetAutoSlide() {
        clearInterval(slideInterval);
        startAutoSlide();
    }

    function initDots() {
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                goToSlide(index);
                resetAutoSlide();
            });
            dotsWrapper.appendChild(dot);
        });
    }

    function goToSlide(index) {
        currentSlide = index;
        sliderContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            goToSlide(currentSlide);
            resetAutoSlide();
        });

        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % slides.length;
            goToSlide(currentSlide);
            resetAutoSlide();
        });
    }

    initDots();
    startAutoSlide();

   document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-main');
    if (btn) {
        e.preventDefault();
        const modalId = btn.getAttribute('data-idx');
        const modal = document.getElementById(modalId);
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    const closeBtn = e.target.closest('.close-modal');
    if (closeBtn) {
        const modal = closeBtn.closest('.modal-overlay');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    if (e.target.classList.contains('modal-overlay')) {
        e.target.style.display = 'none';
    }
});

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});