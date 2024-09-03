import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

window.addEventListener('DOMContentLoaded', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('model-canvas'), alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const loader = new GLTFLoader();
    let model = null;

    const sectionConfigs = [
        { camera: { x: -5, y: 17, z: 12 }, rotation: Math.PI / 2 },
        { camera: { x: 15, y: 10, z: 37 }, rotation: 0 },
        { camera: { x: -14, y: -12, z: 40 }, rotation: Math.PI * 2 }
    ];

    let targetPosition = new THREE.Vector3(sectionConfigs[0].camera.x, sectionConfigs[0].camera.y, sectionConfigs[0].camera.z);
    let targetRotation = sectionConfigs[0].rotation;

    loader.load('model.glb', function(gltf) {
        model = gltf.scene;
        scene.add(model);
        model.scale.set(0.4, 0.4, 0.4);
        model.position.set(0, -1.5, 0);

        camera.position.copy(targetPosition);
        model.rotation.y = targetRotation;

        window.addEventListener('resize', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        });
    });

    const sections = document.querySelectorAll('section');
    const fadeElements = {
        about: document.querySelector('#about p'),
        projects: document.querySelector('#projects p'),
        contact: document.querySelectorAll('#contact .contact-content p')
    };

    let currentSection = 0;
    let isScrolling = false;
    let scrollThreshold = 50;
    let scrollAccumulator = 0;

    function scrollToSection(index) {
        if (index >= 0 && index < sections.length && !isScrolling) {
            isScrolling = true;

            const currentFadeElements = fadeElements[sections[currentSection].id];
            if (currentFadeElements) {
                if (NodeList.prototype.isPrototypeOf(currentFadeElements)) {
                    currentFadeElements.forEach(element => {
                        element.classList.remove('fade-in');
                        element.classList.add('fade-out');
                    });
                } else {
                    currentFadeElements.classList.remove('fade-in');
                    currentFadeElements.classList.add('fade-out');
                }
            }

            setTimeout(() => {
                sections[index].scrollIntoView({ behavior: 'instant' });

                const sectionId = sections[index].id;
                const sectionIndex = [...sections].indexOf(sections[index]);
                const nextFadeElements = fadeElements[sectionId];

                targetPosition.set(sectionConfigs[sectionIndex].camera.x, sectionConfigs[sectionIndex].camera.y, sectionConfigs[sectionIndex].camera.z);
                targetRotation = sectionConfigs[sectionIndex].rotation;

                setTimeout(() => {
                    if (nextFadeElements) {
                        if (NodeList.prototype.isPrototypeOf(nextFadeElements)) {
                            nextFadeElements.forEach(element => {
                                element.classList.remove('fade-out');
                                element.classList.add('fade-in');
                            });
                        } else {
                            nextFadeElements.classList.remove('fade-out');
                            nextFadeElements.classList.add('fade-in');
                        }
                    }

                    isScrolling = false;
                    currentSection = index;
                    scrollAccumulator = 0; 
                }, 500); 
            }, 500); 
        }
    }

    function handleScroll(event) {
        if (isScrolling) return; 

        scrollAccumulator += event.deltaY;

        if (scrollAccumulator >= scrollThreshold && currentSection < sections.length - 1) {
            scrollToSection(currentSection + 1);
        } else if (scrollAccumulator <= -scrollThreshold && currentSection > 0) {
            scrollToSection(currentSection - 1);
        }
    }

    window.addEventListener('wheel', handleScroll, { passive: false });

    function animate() {
        requestAnimationFrame(animate);

        camera.position.lerp(targetPosition, 0.1);

        if (model) {
            model.rotation.y += (targetRotation - model.rotation.y) * 0.1;
        }

        renderer.render(scene, camera);
    }
    animate();

    const gridCanvas = document.getElementById('grid-canvas');
    const ctx = gridCanvas.getContext('2d');

    const gridSize = 50;
    const speed = 1;
    const waveAmplitude = 5;
    const waveFrequency = 0.05;
    let offset = 0;
    let time = 0;

    function resizeCanvas() {
        gridCanvas.width = window.innerWidth;
        gridCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function drawGrid() {
        ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
        ctx.strokeStyle = '#555';
        ctx.fillStyle = '#000';

        for (let x = -gridSize + (offset % gridSize); x < gridCanvas.width; x += gridSize) {
            for (let y = 0; y < gridCanvas.height; y += gridSize) {
                const tlX = x + Math.sin((y + time) * waveFrequency) * waveAmplitude;
                const tlY = y + Math.cos((x + time) * waveFrequency) * waveAmplitude;
                const trX = x + gridSize + Math.sin((y + time) * waveFrequency) * waveAmplitude;
                const trY = y + Math.cos((x + gridSize + time) * waveFrequency) * waveAmplitude;
                const brX = x + gridSize + Math.sin((y + gridSize + time) * waveFrequency) * waveAmplitude;
                const brY = y + gridSize + Math.cos((x + gridSize + time) * waveFrequency) * waveAmplitude;
                const blX = x + Math.sin((y + gridSize + time) * waveFrequency) * waveAmplitude;
                const blY = y + gridSize + Math.cos((x + time) * waveFrequency) * waveAmplitude;

                ctx.beginPath();
                ctx.moveTo(tlX, tlY);
                ctx.lineTo(trX, trY);
                ctx.lineTo(brX, brY);
                ctx.lineTo(blX, blY);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }

        offset += speed;
        time += 0.1;
        requestAnimationFrame(drawGrid);
    }
    drawGrid();

    fadeElements.about.classList.add('fade-in');
});
