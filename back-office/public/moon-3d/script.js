// Variáveis globais
let scene, camera, renderer, moon, raycaster, mouse;
const points = [];
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let autoRotate = true;

// Definir os pontos da lua com funcionalidades
const moonPoints = [
    { id: 1, name: 'Dashboard', description: 'Visão geral das operações', x: 0, y: 50, z: 100 },
    { id: 2, name: 'Pedidos', description: 'Gerencie pedidos activos', x: 80, y: 30, z: 60 },
    { id: 3, name: 'Histórico', description: 'Ver histórico completo', x: -80, y: 30, z: 60 },
    { id: 4, name: 'Clientes', description: 'Gerencie todos os clientes', x: 60, y: -50, z: 80 },
    { id: 5, name: 'Estafetas', description: 'Gerencie estafetas disponíveis', x: -60, y: -50, z: 80 },
    { id: 6, name: 'Mapa', description: 'Visualize rotas e entregas', x: 0, y: -80, z: 100 }
];

// Inicializar Three.js
function initThreeJS() {
    const container = document.getElementById('container');

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 250;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffffff, 1.2);
    sunLight.position.set(200, 100, 150);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Stars
    createStars();

    // Load moon
    loadMoon();

    // Raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Event listeners
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('click', onMouseClick, false);
    window.addEventListener('resize', onWindowResize, false);

    // Mouse controls
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mouseleave', onMouseUp);

    // Close info box
    document.getElementById('info-close').addEventListener('click', () => {
        document.getElementById('info-box').classList.add('hidden');
    });

    // Start animation
    animate();
}

// Criar estrelas de fundo
function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });

    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(starsVertices), 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

// Carregar textura da lua
function loadMoon() {
    const textureLoader = new THREE.TextureLoader();

    textureLoader.load(
        '/moon.jpg',
        (texture) => {
            createMoon(texture);
        },
        undefined,
        () => {
            console.error('Erro ao carregar moon.jpg, usando cor cinzenta');
            createMoon(null);
        }
    );
}

// Criar esfera da lua
function createMoon(texture) {
    const geometry = new THREE.SphereGeometry(100, 64, 64);
    let material;

    if (texture) {
        material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.7,
            metalness: 0.3
        });
    } else {
        material = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            roughness: 0.7,
            metalness: 0.3
        });
    }

    moon = new THREE.Mesh(geometry, material);
    moon.castShadow = true;
    moon.receiveShadow = true;
    scene.add(moon);

    // Adicionar pontos clicáveis
    createClickablePoints();
}

// Criar pontos clicáveis na lua
function createClickablePoints() {
    const colors = [0x00f2ff, 0xff6b6b, 0xffd93d, 0x6bcf7f, 0xa78bfa, 0x38b6ff];

    moonPoints.forEach((pointData, index) => {
        const vector = new THREE.Vector3(pointData.x, pointData.y, pointData.z);
        vector.normalize().multiplyScalar(105);

        const geometry = new THREE.SphereGeometry(5, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: colors[index] });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(vector);
        sphere.userData = { ...pointData };
        sphere.name = 'clickPoint';

        moon.add(sphere);
        points.push(sphere);
    });
}

// Event handlers
function onMouseDown(event) {
    isDragging = true;
    previousMousePosition = { x: event.clientX, y: event.clientY };
    autoRotate = false;
}

function onMouseMove(event) {
    const rect = document.getElementById('container').getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / window.innerWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / window.innerHeight) * 2 + 1;

    if (isDragging && moon) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;
        moon.rotation.y += deltaX * 0.005;
        moon.rotation.x += deltaY * 0.005;
        previousMousePosition = { x: event.clientX, y: event.clientY };
    }

    // Check for hover
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(points);
    document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
}

function onMouseUp() {
    isDragging = false;
    autoRotate = true;
}

function onMouseClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(points);

    if (intersects.length > 0) {
        const data = intersects[0].object.userData;
        document.getElementById('info-title').textContent = data.name;
        document.getElementById('info-description').textContent = data.description;
        document.getElementById('info-box').classList.remove('hidden');
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (moon) {
        if (autoRotate) {
            moon.rotation.y += 0.0005;
        }
    }

    renderer.render(scene, camera);
}

// Iniciar quando o documento está pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThreeJS);
} else {
    initThreeJS();
}
