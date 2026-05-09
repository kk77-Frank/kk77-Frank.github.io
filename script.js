const yearTarget = document.querySelector("#currentYear");
if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 }
  );

  sections.forEach((section) => observer.observe(section));
}

const canvas = document.querySelector("#signalCanvas");
const context = canvas?.getContext("2d");

function resizeCanvas() {
  if (!canvas || !context) return;
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawSignalFrame(time = 0) {
  if (!canvas || !context) return;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  context.clearRect(0, 0, width, height);

  const gridColor = "rgba(255, 255, 255, 0.16)";
  context.strokeStyle = gridColor;
  context.lineWidth = 1;
  for (let x = 0; x <= width; x += 34) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 0; y <= height; y += 34) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  drawWave({
    y: height * 0.32,
    amplitude: height * 0.11,
    speed: time * 0.0014,
    color: "rgba(92, 228, 199, 0.95)",
    width,
  });
  drawWave({
    y: height * 0.52,
    amplitude: height * 0.08,
    speed: time * 0.001,
    color: "rgba(255, 196, 89, 0.88)",
    width,
    phase: 1.4,
  });
  drawWave({
    y: height * 0.72,
    amplitude: height * 0.06,
    speed: time * 0.0018,
    color: "rgba(239, 126, 91, 0.86)",
    width,
    phase: 2.2,
  });

  drawNodes(width, height, time);
  requestAnimationFrame(drawSignalFrame);
}

function drawWave({ y, amplitude, speed, color, width, phase = 0 }) {
  context.beginPath();
  for (let x = 0; x <= width; x += 3) {
    const spike = Math.exp(-Math.pow(((x + speed * 140) % 180) - 90, 2) / 90) * amplitude * 1.4;
    const value =
      y +
      Math.sin(x * 0.035 + speed * 5 + phase) * amplitude * 0.44 +
      Math.sin(x * 0.105 - speed * 2 + phase) * amplitude * 0.2 -
      spike;
    if (x === 0) {
      context.moveTo(x, value);
    } else {
      context.lineTo(x, value);
    }
  }
  context.strokeStyle = color;
  context.lineWidth = 2.4;
  context.stroke();
}

function drawNodes(width, height, time) {
  const nodes = [
    [0.66, 0.24],
    [0.82, 0.34],
    [0.7, 0.56],
    [0.9, 0.63],
    [0.78, 0.78],
  ];

  context.strokeStyle = "rgba(32, 35, 41, 0.28)";
  context.lineWidth = 1.3;
  nodes.slice(1).forEach((node, index) => {
    const previous = nodes[index];
    context.beginPath();
    context.moveTo(previous[0] * width, previous[1] * height);
    context.lineTo(node[0] * width, node[1] * height);
    context.stroke();
  });

  nodes.forEach(([xRatio, yRatio], index) => {
    const pulse = 2 + Math.sin(time * 0.004 + index) * 1.4;
    context.beginPath();
    context.arc(xRatio * width, yRatio * height, 5 + pulse, 0, Math.PI * 2);
    context.fillStyle = index % 2 === 0 ? "#008f7a" : "#d75f3f";
    context.fill();
    context.lineWidth = 4;
    context.strokeStyle = "rgba(255, 255, 255, 0.78)";
    context.stroke();
  });
}

if (canvas && context) {
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  requestAnimationFrame(drawSignalFrame);
}
