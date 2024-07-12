import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

// Setup renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x909090); // Set background color
document.body.appendChild(renderer.domElement);

// Setup camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 12, 10);

// Setup scene
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x202020, 0.03); // Add fog for depth

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Add lights
function setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight2.position.set(-5, -10, -7);
    scene.add(dirLight2);
}
setupLights();

// Create triangle geometry
function createTriangleGeometry() {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        0, Math.sqrt(3) / 2, 0, // Top vertex
        -0.5, -Math.sqrt(3) / 2 / 2, 0, // Bottom left vertex
        0.5, -Math.sqrt(3) / 2 / 2, 0 // Bottom right vertex
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    return geometry;
}

const triangleGeometry = createTriangleGeometry();

// Material for the triangle
const triangleMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.5,
    metalness: 0.9
});

// Create and position triangles
function createTriangles(numInstances, radius) {
    const triangleGroup = new THREE.Group();
    scene.add(triangleGroup);

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3(0.1, 0.1, 0.1);

    for (let i = 0; i < numInstances; i++) {
        position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(radius);
        quaternion.set(Math.random(), Math.random(), Math.random(), Math.random()).normalize();
        matrix.compose(position, quaternion, scale);

        const triangleMesh = new THREE.Mesh(triangleGeometry, triangleMaterial);
        triangleMesh.applyMatrix4(matrix);
        triangleGroup.add(triangleMesh);
    }

    return triangleGroup;
}

const triangleGroup = createTriangles(15000, 7); // Reduced number for better performance

// Function to create and add a mesh to the scene
function addMesh(geometry, material, position) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    scene.add(mesh);
    return mesh;
}

// Create other meshes
const meshes = [];
meshes.push(addMesh(
    new THREE.IcosahedronGeometry(1, 4), 
    new THREE.MeshStandardMaterial({ 
        color: 0x8A3324, 
        metalness: 0.7, 
        roughness: 0.1 
    }), 
    new THREE.Vector3(-3, 1, 2)
));

meshes.push(addMesh(
    new THREE.TorusGeometry(1, 0.3, 16, 100), 
    new THREE.MeshStandardMaterial({ 
        color: 0xD4AABE , 
        metalness: 0.5, 
        roughness: 0.6 
    }), 
    new THREE.Vector3(3, 1, 2)
));

meshes.push(addMesh(
    new THREE.BoxGeometry(1, 1, 1), 
    new THREE.MeshStandardMaterial({ 
        color: 0xE6E6FA, 
        metalness: 0.4, 
        roughness: 0.8 
    }), 
    new THREE.Vector3(0, -1, -3)
));

meshes.push(addMesh(
    new THREE.DodecahedronGeometry(1, 0), 
    new THREE.MeshStandardMaterial({ 
        color: 0x2F4F4F, 
        metalness: 0.7, 
        roughness: 0.3 
    }), 
    new THREE.Vector3(-2, -1, -4)
));

meshes.push(addMesh(
    new THREE.TorusKnotGeometry(0.8, 0.3, 100, 16), 
    new THREE.MeshStandardMaterial({ 
        color: 0x534B4F
        , 
        metalness: 0.6, 
        roughness: 0.4 
    }), 
    new THREE.Vector3(4, 0, -1)
));

// Handle texture loading for one mesh
const textureLoader = new THREE.TextureLoader();
textureLoader.load('assets/textures/texture.jpg', (texture) => {
    const mat4 = new THREE.MeshStandardMaterial({ map: texture, metalness: 0.8, roughness: 0.2 });
    const mesh4 = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 3), mat4);
    mesh4.position.set(-4, 1, 0);
    scene.add(mesh4);
    meshes.push(mesh4);
}, undefined, (err) => console.error('Error loading texture:', err));

// Interaction setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let INTERSECTED = null;

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        intersects[0].object.material.color.set(0xFF69B4); // Change color on click
    }
}

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('click', onClick, false);

// Resize handling
function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

window.addEventListener('resize', onWindowResize);

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        if (INTERSECTED != intersects[0].object) {
            if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
            INTERSECTED = intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex(0x444444);
        }
    } else {
        if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
        INTERSECTED = null;
    }


    // Rotate all meshes
    meshes.forEach(mesh => mesh.rotation.y += 0.01);

    // Rotate triangle group
    triangleGroup.rotation.y += 0.01;

    // Animate Sphere 1
    const sphere1Distance = 10;
    const speed1 = 0.001;
    sphere1.position.x = Math.cos(Date.now() * speed1) * sphere1Distance;
    sphere1.position.z = Math.sin(Date.now() * speed1) * sphere1Distance;

    // Animate Sphere 2
    const sphere2Distance = 2;
    const speed2 = 0.003;
    sphere2.position.x = Math.cos(Date.now() * speed2) * sphere2Distance;
    sphere2.position.z = Math.sin(Date.now() * speed2) * sphere2Distance;

    controls.update();
    renderer.render(scene, camera);
}

// Create Sphere 1
const sphereGeometry1 = new THREE.SphereGeometry(0.9, 32, 32);
const sphereMaterial1 = new THREE.MeshStandardMaterial({
    color: 0xB2BEB5,  
    roughness: 0.2
});

const sphere1 = new THREE.Mesh(sphereGeometry1, sphereMaterial1);
scene.add(sphere1);

// Position sphere1 initially relative to triangleGroup
const sphere1Distance = 10; // Distance from triangleGroup
sphere1.position.set(sphere1Distance, 0, 0);

// Create Sphere 2
const sphereGeometry2 = new THREE.SphereGeometry(0.7, 24, 24);
const sphereMaterial2 = new THREE.MeshStandardMaterial({
    color: 0x36454F,  
    metalness: 0.6,
    roughness: 0.4
});

const sphere2 = new THREE.Mesh(sphereGeometry2, sphereMaterial2);
sphere1.add(sphere2);

// Position sphere2 initially relative to sphere1
const sphere2Distance = 2; // Distance from sphere1
sphere2.position.set(sphere2Distance, 0, 0);

animate();