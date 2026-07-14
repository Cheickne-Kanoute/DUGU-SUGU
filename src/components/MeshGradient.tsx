import { useEffect, useRef } from 'react';

// Simplex noise implementation
const PERM = [
  151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,
  140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,
  247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,
  57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,
  74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,
  60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,
  65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,
  200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,
  52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,
  207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,
  119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,
  129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,
  218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,
  81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,
  184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,
  222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180,
];

const perm = new Array(512);
for (let i = 0; i < 512; i++) perm[i] = PERM[i & 255];

function grad2(hash: number) {
  const h = hash & 3;
  const grad = [
    [1, 1], [-1, 1], [1, -1], [-1, -1],
  ];
  return grad[h];
}

function noise2D(xin: number, yin: number): number {
  const F2 = 0.5 * (Math.sqrt(3) - 1);
  const G2 = (3 - Math.sqrt(3)) / 6;
  const s = (xin + yin) * F2;
  const i = Math.floor(xin + s);
  const j = Math.floor(yin + s);
  const t = (i + j) * G2;
  const X0 = i - t;
  const Y0 = j - t;
  const x0 = xin - X0;
  const y0 = yin - Y0;
  let i1: number, j1: number;
  if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }
  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1 + 2 * G2;
  const y2 = y0 - 1 + 2 * G2;
  const ii = i & 255;
  const jj = j & 255;
  const gi0 = perm[ii + perm[jj]];
  const gi1 = perm[ii + i1 + perm[jj + j1]];
  const gi2 = perm[ii + 1 + perm[jj + 1]];
  let n0 = 0, n1 = 0, n2 = 0;
  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 >= 0) {
    t0 *= t0;
    const g = grad2(gi0);
    n0 = t0 * t0 * (g[0] * x0 + g[1] * y0);
  }
  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 >= 0) {
    t1 *= t1;
    const g = grad2(gi1);
    n1 = t1 * t1 * (g[0] * x1 + g[1] * y1);
  }
  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 >= 0) {
    t2 *= t2;
    const g = grad2(gi2);
    n2 = t2 * t2 * (g[0] * x2 + g[1] * y2);
  }
  return 70 * (n0 + n1 + n2);
}

interface Circle {
  cx: number;
  cy: number;
  r: number;
  targetR: number;
  dx: number;
  dy: number;
  hue: number;
  pathRef: SVGPathElement | null;
  noiseOffsetX: number;
  noiseOffsetY: number;
}

export default function MeshGradient() {
  const svgRef = useRef<SVGSVGElement>(null);
  const circlesRef = useRef<Circle[]>([]);
  const animFrameRef = useRef<number | undefined>(undefined);
  const lastMorphRef = useRef<number>(0);
  const morphTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // Initialize circles
    const circles: Circle[] = [
      // Main blobs
      { cx: 20, cy: 30, r: 18, targetR: 18, dx: 0.2, dy: 0.15, hue: 0, pathRef: null, noiseOffsetX: Math.random() * 1000, noiseOffsetY: Math.random() * 1000 },
      { cx: 80, cy: 20, r: 18, targetR: 18, dx: -0.15, dy: 0.1, hue: 0, pathRef: null, noiseOffsetX: Math.random() * 1000, noiseOffsetY: Math.random() * 1000 },
      { cx: 30, cy: 75, r: 18, targetR: 18, dx: 0.1, dy: -0.2, hue: 0, pathRef: null, noiseOffsetX: Math.random() * 1000, noiseOffsetY: Math.random() * 1000 },
      { cx: 70, cy: 80, r: 18, targetR: 18, dx: -0.18, dy: 0.12, hue: 0, pathRef: null, noiseOffsetX: Math.random() * 1000, noiseOffsetY: Math.random() * 1000 },
      // Ping-pong blobs
      { cx: 10, cy: 50, r: 6, targetR: 6, dx: 0.5, dy: 0.4, hue: 0, pathRef: null, noiseOffsetX: Math.random() * 1000, noiseOffsetY: Math.random() * 1000 },
      { cx: 90, cy: 50, r: 6, targetR: 6, dx: -0.4, dy: -0.3, hue: 0, pathRef: null, noiseOffsetX: Math.random() * 1000, noiseOffsetY: Math.random() * 1000 },
    ];

    // Set path refs
    const paths = svgRef.current?.querySelectorAll('.mesh-circle');
    if (paths) {
      paths.forEach((path, i) => {
        if (circles[i]) {
          circles[i].pathRef = path as SVGPathElement;
        }
      });
    }

    circlesRef.current = circles;

    // Morph scheduling
    const scheduleMorph = () => {
      const delay = 3000 + Math.random() * 5000;
      morphTimeoutRef.current = setTimeout(() => {
        const idx = Math.floor(Math.random() * 4); // Only morph main blobs
        const circle = circlesRef.current[idx];
        if (circle) {
          const newTargetR = 14 + Math.random() * 10;
          const duration = 2000 + Math.random() * 2000;
          const startR = circle.r;
          const startTime = Date.now();

          const morph = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Elastic ease out
            const p = progress;
            const elastic = 1 - Math.pow(2, -10 * p) * Math.cos((p * 10 - 0.75) * ((2 * Math.PI) / 3));
            circle.r = startR + (newTargetR - startR) * elastic;
            circle.targetR = circle.r;

            if (progress < 1) {
              requestAnimationFrame(morph);
            }
          };
          requestAnimationFrame(morph);
        }
        lastMorphRef.current = Date.now();
        scheduleMorph();
      }, delay);
    };
    scheduleMorph();

    // Animation loop
    const animate = () => {
      const allCircles = circlesRef.current;

      for (let c = 0; c < allCircles.length; c++) {
        const circle = allCircles[c];
        circle.noiseOffsetX += 0.003;
        circle.noiseOffsetY += 0.003;

        const nX = noise2D(circle.noiseOffsetX, circle.noiseOffsetY) * 0.5;
        const nY = noise2D(circle.noiseOffsetX + 100, circle.noiseOffsetY + 100) * 0.5;

        circle.cx += circle.dx + nX;
        circle.cy += circle.dy + nY;

        const velocityClamp = c < 4 ? 0.5 : 0.8;
        circle.dx += (Math.random() - 0.5) * 0.01;
        circle.dy += (Math.random() - 0.5) * 0.01;
        circle.dx = Math.max(-velocityClamp, Math.min(velocityClamp, circle.dx));
        circle.dy = Math.max(-velocityClamp, Math.min(velocityClamp, circle.dy));

        // Bounce off edges
        if (circle.cx < circle.r) { circle.dx = Math.abs(circle.dx); circle.cx = circle.r; }
        if (circle.cx > 100 - circle.r) { circle.dx = -Math.abs(circle.dx); circle.cx = 100 - circle.r; }
        if (circle.cy < circle.r) { circle.dy = Math.abs(circle.dy); circle.cy = circle.r; }
        if (circle.cy > 100 - circle.r) { circle.dy = -Math.abs(circle.dy); circle.cy = 100 - circle.r; }

        // Build path with noise
        const nSegments = 12;
        const angleStep = (Math.PI * 2) / nSegments;
        let d = '';

        for (let i = 0; i < nSegments; i++) {
          const angle = i * angleStep;
          const rNoise = noise2D(circle.noiseOffsetX + i * 0.5, circle.noiseOffsetY + i * 0.5) * 1.5;
          const currentR = circle.r + rNoise;
          const x = circle.cx + Math.cos(angle) * currentR;
          const y = circle.cy + Math.sin(angle) * currentR;

          if (i === 0) {
            d += `M ${x.toFixed(2)} ${y.toFixed(2)}`;
          } else {
            d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
          }
        }
        d += ' Z';

        if (circle.pathRef) {
          circle.pathRef.setAttribute('d', d);
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current !== undefined) cancelAnimationFrame(animFrameRef.current);
      if (morphTimeoutRef.current) clearTimeout(morphTimeoutRef.current);
    };
  }, []);

  return (
    <>
      {/* SVG Gradient Canvas */}
      <svg
        ref={svgRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
            <feBlend in="SourceGraphic" mode="overlay" />
          </filter>
        </defs>
        <g filter="url(#goo) url(#noise)">
          {/* Main blobs */}
          <path className="mesh-circle" fill="#22c55e" opacity="0.92" d="M 20 30 m -18 0 a 18 18 0 1 0 36 0 a 18 18 0 1 0 -36 0" />
          <path className="mesh-circle" fill="#22c55e" opacity="0.92" d="M 80 20 m -18 0 a 18 18 0 1 0 36 0 a 18 18 0 1 0 -36 0" />
          <path className="mesh-circle" fill="#22c55e" opacity="0.92" d="M 30 75 m -18 0 a 18 18 0 1 0 36 0 a 18 18 0 1 0 -36 0" />
          <path className="mesh-circle" fill="#22c55e" opacity="0.92" d="M 70 80 m -18 0 a 18 18 0 1 0 36 0 a 18 18 0 1 0 -36 0" />
          {/* Ping-pong blobs */}
          <path className="mesh-circle" fill="#22c55e" opacity="0.95" d="M 10 50 m -6 0 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0" />
          <path className="mesh-circle" fill="#22c55e" opacity="0.95" d="M 90 50 m -6 0 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0" />
        </g>
      </svg>

      {/* Dot-Matrix Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
          opacity: 0.4,
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundImage: 'radial-gradient(circle, rgba(212, 160, 23, 0.15) 1px, transparent 1px)',
            backgroundSize: '12px 12px',
            mixBlendMode: 'overlay',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundImage: 'radial-gradient(circle, rgba(248, 246, 240, 0.3) 1px, transparent 1px)',
            backgroundSize: '12px 12px',
            mixBlendMode: 'soft-light',
            transform: 'translate(6px, 6px)',
          }}
        />
      </div>
    </>
  );
}
