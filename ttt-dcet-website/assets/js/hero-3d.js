/* T.T.T Academy — 3D hero: rotating knowledge globe, floating books & engineering objects.
   Classic script that lazy-loads Three.js (ES module) from the CDN, so it also works from file:// previews.
   Loaded only on the home page. Pauses off-screen; static under reduced motion. */
(async () => {
const canvas = document.getElementById('hero3d');
if (!canvas || !window.WebGLRenderingContext) return;
let THREE;
try { THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js'); } catch (e) { return; }
init();

function init() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.innerWidth < 768;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 11);

  /* Lights */
  scene.add(new THREE.AmbientLight(0x8fa8ff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(4, 6, 8); scene.add(key);
  const blue = new THREE.PointLight(0x2f6bff, 40, 30); blue.position.set(-6, 2, 4); scene.add(blue);
  const violet = new THREE.PointLight(0x9b4dff, 40, 30); violet.position.set(6, -3, 3); scene.add(violet);

  /* ---- Knowledge globe ---- */
  const globe = new THREE.Group();
  const R = 2.3;
  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(R, 3)),
    new THREE.LineBasicMaterial({ color: 0x5b8cff, transparent: true, opacity: 0.18 })
  );
  globe.add(wire);
  const core = new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, 48, 48), new THREE.MeshStandardMaterial({ color: 0x0b1437, emissive: 0x1b2a63, emissiveIntensity: 0.6, roughness: 0.4, metalness: 0.2, transparent: true, opacity: 0.55 }));
  globe.add(core);
  // latitude rings
  for (let i = -2; i <= 2; i++) {
    const y = (i / 3) * R;
    const r = Math.sqrt(R * R - y * y);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 6, 96), new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.45 }));
    ring.rotation.x = Math.PI / 2; ring.position.y = y; globe.add(ring);
  }
  // meridian ring
  const meridian = new THREE.Mesh(new THREE.TorusGeometry(R, 0.01, 6, 120), new THREE.MeshBasicMaterial({ color: 0x5b8cff, transparent: true, opacity: 0.5 }));
  globe.add(meridian);
  // glowing nodes on surface ("learners across Karnataka")
  const nPts = mobile ? 160 : 360;
  const pos = new Float32Array(nPts * 3);
  for (let i = 0; i < nPts; i++) {
    const u = Math.random(), v = Math.random();
    const th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1);
    pos[i * 3] = R * 1.01 * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = R * 1.01 * Math.cos(ph);
    pos[i * 3 + 2] = R * 1.01 * Math.sin(ph) * Math.sin(th);
  }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  globe.add(new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xcfe0ff, size: mobile ? 0.05 : 0.04, transparent: true, opacity: 0.9 })));
  // orbit + satellite
  const orbit = new THREE.Group();
  orbit.add(new THREE.Mesh(new THREE.TorusGeometry(R * 1.45, 0.012, 6, 160), new THREE.MeshBasicMaterial({ color: 0xf5c451, transparent: true, opacity: 0.55 })));
  const sat = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 24), new THREE.MeshStandardMaterial({ color: 0xf5c451, emissive: 0xf0a53a, emissiveIntensity: 1.2 }));
  sat.position.x = R * 1.45; orbit.add(sat);
  orbit.rotation.set(1.2, 0.3, 0.2);
  globe.add(orbit);
  scene.add(globe);

  /* ---- Floating books ---- */
  const makeBook = (cover) => {
    const g = new THREE.Group();
    const coverMat = new THREE.MeshStandardMaterial({ color: cover, roughness: 0.45, metalness: 0.1 });
    const pages = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.16, 0.8), new THREE.MeshStandardMaterial({ color: 0xf6f3ea, roughness: 0.9 }));
    pages.position.x = 0.03;
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.025, 0.86), coverMat); top.position.y = 0.092;
    const bot = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.025, 0.86), coverMat); bot.position.y = -0.092;
    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.21, 0.86), coverMat); spine.position.x = -0.555;
    g.add(pages, top, bot, spine);
    return g;
  };

  /* ---- Engineering objects ---- */
  const makeGear = (teeth = 12, r = 0.55) => {
    const shape = new THREE.Shape();
    const inner = r * 0.78, step = (Math.PI * 2) / (teeth * 2);
    for (let i = 0; i < teeth * 2; i++) {
      const rad = i % 2 ? inner : r;
      const a0 = i * step, a1 = a0 + step;
      if (i === 0) shape.moveTo(Math.cos(a0) * rad, Math.sin(a0) * rad);
      shape.lineTo(Math.cos(a0) * rad, Math.sin(a0) * rad);
      shape.lineTo(Math.cos(a1) * rad, Math.sin(a1) * rad);
    }
    const hole = new THREE.Path(); hole.absarc(0, 0, r * 0.28, 0, Math.PI * 2, true); shape.holes.push(hole);
    return new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 }), new THREE.MeshStandardMaterial({ color: 0xb8c6ff, metalness: 0.75, roughness: 0.3 }));
  };

  const floaters = [];
  const add = (obj, x, y, z, spin) => { obj.position.set(x, y, z); obj.userData = { base: new THREE.Vector3(x, y, z), spin, phase: Math.random() * Math.PI * 2 }; scene.add(obj); floaters.push(obj); };

  add(makeBook(0x2f6bff), -6.4, 2.2, -1, [0.003, 0.006, 0.002]);
  add(makeBook(0x7c3aed), -6.2, -2.9, 0.5, [0.004, -0.005, 0.003]);
  add(makeBook(0xc98a12), 7.2, 2.6, -2, [-0.003, 0.004, 0.002]);
  add(makeGear(14, 0.6), 7.0, -2.8, -0.5, [0.0, 0.0, 0.01]);
  if (!mobile) {
    add(makeBook(0x0ea5e9), 0.6, -3.6, -4, [0.005, 0.003, -0.002]);
    add(makeGear(10, 0.42), -6.8, 0.2, -1.5, [0.0, 0.0, -0.014]);
    add(new THREE.Mesh(new THREE.TorusKnotGeometry(0.38, 0.12, 120, 16), new THREE.MeshStandardMaterial({ color: 0xa78bfa, metalness: 0.6, roughness: 0.25 })), 4.2, -3.4, 0, [0.006, 0.008, 0]);
    add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.55)), new THREE.LineBasicMaterial({ color: 0x5b8cff })), 1.2, 3.0, -5, [0.004, 0.007, 0]);
    add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.TetrahedronGeometry(0.5)), new THREE.LineBasicMaterial({ color: 0xf5c451 })), -2.6, -3.6, -3, [0.007, 0.004, 0.003]);
    add(new THREE.Mesh(new THREE.CylinderGeometry(0, 0.4, 0.7, 4), new THREE.MeshStandardMaterial({ color: 0x22d3ee, metalness: 0.4, roughness: 0.3, flatShading: true })), -8.4, 0.6, -3, [0.006, 0.01, 0]);
  }

  /* ---- Starfield ---- */
  const sN = mobile ? 250 : 600, sp = new Float32Array(sN * 3);
  for (let i = 0; i < sN * 3; i++) sp[i] = (Math.random() - 0.5) * 40;
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0x8fa8ff, size: 0.03, transparent: true, opacity: 0.6 }));
  scene.add(stars);

  /* ---- Layout ---- */
  const layout = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const desktop = w >= 992;
    globe.position.set(desktop ? 3.6 : 0, desktop ? 0.2 : 3.2, desktop ? -1 : -4);
    globe.scale.setScalar(desktop ? 1 : 0.85);
  };
  layout();
  window.addEventListener('resize', layout);

  /* ---- Interaction ---- */
  const mouse = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => { mouse.x = e.clientX / window.innerWidth - 0.5; mouse.y = e.clientY / window.innerHeight - 0.5; }, { passive: true });
  let scrollBoost = 0, lastScroll = window.scrollY;
  window.addEventListener('scroll', () => { scrollBoost += Math.abs(window.scrollY - lastScroll) * 0.0004; lastScroll = window.scrollY; }, { passive: true });

  let visible = true, raf = 0;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !raf && !reduced) loop(); }, { threshold: 0 }).observe(canvas);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !raf && !reduced) loop(); });

  const clock = new THREE.Clock();
  const render = () => {
    const t = clock.getElapsedTime();
    scrollBoost *= 0.94;
    globe.rotation.y += 0.0025 + scrollBoost;
    globe.rotation.x = 0.25 + Math.sin(t * 0.2) * 0.05;
    orbit.rotation.z = t * 0.5;
    floaters.forEach((o) => {
      const { base, spin, phase } = o.userData;
      o.position.y = base.y + Math.sin(t * 0.8 + phase) * 0.25;
      o.position.x = base.x + Math.cos(t * 0.5 + phase) * 0.12;
      o.rotation.x += spin[0]; o.rotation.y += spin[1]; o.rotation.z += spin[2];
    });
    stars.rotation.y = t * 0.01;
    camera.position.x += (mouse.x * 1.4 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.y * 0.9 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  };
  const loop = () => {
    if (!visible || document.hidden) { raf = 0; return; }
    render();
    raf = requestAnimationFrame(loop);
  };
  if (reduced) render(); else loop();
}
})();
