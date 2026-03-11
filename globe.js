document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('hero-globe-container');
  if (!container) return;

  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 240;
  
  // no offset, keep globe perfectly centered
  camera.position.x = 0; 

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // 1. Math dense particle sphere
  const particleCount = 2500;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  const radius = 80;
  const colorDark = new THREE.Color('#34d399'); // Green/Blue hue
  const colorLight = new THREE.Color('#ffe17c'); // Yellow hue

  const phiMath = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < particleCount; i++) {
    const y = 1 - (i / (particleCount - 1)) * 2; 
    const r = Math.sqrt(1 - y * y);
    const theta = phiMath * i;

    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    // Apply radius and a little random noise
    const noise = 1 + (Math.random() - 0.5) * 0.03;
    
    positions[i * 3] = x * radius * noise;
    positions[i * 3 + 1] = y * radius * noise;
    positions[i * 3 + 2] = z * radius * noise;

    const mixRatio = (y + 1) / 2;
    const pColor = colorDark.clone().lerp(colorLight, mixRatio + (Math.random()*0.2));
    colors[i * 3] = pColor.r;
    colors[i * 3 + 1] = pColor.g;
    colors[i * 3 + 2] = pColor.b;
    
    sizes[i] = Math.random() < 0.05 ? 3.0 : 1.2; // A few larger blinking stars
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  function createCircleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }

  // Use a ShaderMaterial for individual particle sizes & colors
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0xffffff) },
      pointTexture: { value: createCircleTexture() }
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform sampler2D pointTexture;
      varying vec3 vColor;
      void main() {
        gl_FragColor = vec4(color * vColor, 0.85);
        gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
      }
    `,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true
  });

  const particles = new THREE.Points(geometry, material);
  globeGroup.add(particles);

  // 2. Inner core to occlude background arcs nicely (creates a cinematic void inside)
  const coreGeo = new THREE.SphereGeometry(radius * 0.96, 32, 32);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x0a100e, // deep dark color matching background
    transparent: true,
    opacity: 0.9,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  globeGroup.add(core);

  // 3. Threat Lines (Arcs)
  const linesGroup = new THREE.Group();
  globeGroup.add(linesGroup);
  
  const arcs = [];
  
  function createThreatArc() {
    const startDist = 180 + Math.random() * 80;
    const startVector = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    ).normalize().multiplyScalar(startDist);
    
    const endVector = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    ).normalize().multiplyScalar(radius + 1);
    
    const midPoint = startVector.clone().add(endVector).multiplyScalar(0.5);
    const distance = startVector.distanceTo(endVector);
    midPoint.normalize().multiplyScalar(radius + distance * 0.4);
    
    const curve = new THREE.QuadraticBezierCurve3(startVector, midPoint, endVector);
    const pointsCount = 40;
    const curvePoints = curve.getPoints(pointsCount);
    
    const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    
    // Red color for attack
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xff5f57,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    
    const line = new THREE.Line(lineGeo, lineMat);
    linesGroup.add(line);
    
    // Impact ring (Green - interception)
    const ringGeo = new THREE.RingGeometry(1.5, 3.5, 32);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0x34d399, 
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(endVector);
    ring.lookAt(new THREE.Vector3(0,0,0));
    globeGroup.add(ring);
    
    arcs.push({
        line,
        ring,
        progress: -Math.random() * 2, // stagger start
        speed: 0.01 + Math.random() * 0.015,
        pointsCount: pointsCount
    });
  }

  for(let i=0; i<15; i++) {
    createThreatArc();
  }

  // 4. Mouse Interactive Parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
  });

  // 5. Animation loop
  function animate() {
    requestAnimationFrame(animate);

    // Constant rotation
    globeGroup.rotation.y += 0.002;
    globeGroup.rotation.x += 0.0005;

    // Mouse parallax
    targetX = mouseX * 0.0005;
    targetY = mouseY * 0.0005;
    
    scene.rotation.y += (targetX - scene.rotation.y) * 0.05;
    scene.rotation.x += (targetY - scene.rotation.x) * 0.05;

    // Animate arcs
    arcs.forEach(arc => {
        arc.progress += arc.speed;
        
        if (arc.progress > 1.3) {
            arc.progress = -Math.random() * 1.5; // Reset
            arc.ring.material.opacity = 0;
            arc.ring.scale.set(1, 1, 1);
            arc.line.material.opacity = 0;
        }
        
        if (arc.progress > 0 && arc.progress <= 1) {
            const drawCount = Math.floor(arc.progress * arc.pointsCount);
            arc.line.geometry.setDrawRange(0, drawCount);
            arc.line.material.opacity = 0.5 + Math.random() * 0.4; // flicker effect
        } else if (arc.progress > 1) {
            arc.line.material.opacity = Math.max(0, arc.line.material.opacity - 0.05);
            
            // Ring expansion
            const ringProgress = (arc.progress - 1) * 3.33; // 1 to 1.3 becomes 0 to 1
            if (ringProgress <= 1) {
                arc.ring.scale.set(1 + ringProgress*4, 1 + ringProgress*4, 1);
                arc.ring.material.opacity = 1 - ringProgress;
            } else {
                arc.ring.material.opacity = 0;
            }
        }
    });

    renderer.render(scene, camera);
  }
  
  animate();

  // 6. Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    camera.position.x = 0;
  });
});
