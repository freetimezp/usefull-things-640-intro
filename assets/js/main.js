gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({ lerp: 0.125 });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const stage = document.querySelector(".minerals-stage");
const canvas = document.querySelector(".minerals-canvas");
const context = canvas.getContext("2d", { alpha: false });
const activeRing = document.querySelector(".ring-active");
const names = document.querySelectorAll(".mineral-name");
const sliders = document.querySelectorAll(".label-slider");

const frameCount = 600;
const frames = [];
const sequence = { frame: 0 };
let activeIndex = 0;

document.querySelectorAll(".ring g").forEach((group) => {
    for (let tick = 0; tick < 180; tick++) {
        const angle = (tick * 2 * Math.PI) / 180;
        const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line",
        );
        line.setAttribute("x1", 308 - 308 * Math.cos(angle));
        line.setAttribute("y1", 308 - 308 * Math.sin(angle));
        line.setAttribute("x2", 308 - 296 * Math.cos(angle));
        line.setAttribute("y2", 308 - 296 * Math.sin(angle));
        line.setAttribute("stroke", "#151515");
        group.appendChild(line);
    }
});

for (let index = 0; index < frameCount; index++) {
    const image = new Image();
    image.src = `frames/stone-${String(index + 1).padStart(4, "0")}.avif`;
    image.onload = () => {
        if (index === Math.round(sequence.frame)) drawFrame();
    };
    frames.push(image);
}

function loadedFrame(index) {
    for (let step = 0; step < frameCount; step++) {
        const before = frames[index - step];
        const after = frames[index + step];
        if (before && before.naturalWidth) return before;
        if (after && after.naturalWidth) return after;
    }
    return null;
}

function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    drawFrame();
}

function drawFrame() {
    const image = loadedFrame(Math.round(sequence.frame));
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (!image) return;
    const size = Math.min(canvas.width, canvas.height) * 0.85;
    context.imageSmoothingQuality = "high";
    context.drawImage(
        image,
        (canvas.width - size) / 2,
        (canvas.height - size) / 2,
        size,
        size,
    );
}

function setActive(index) {
    activeIndex = index;
    names.forEach((name, nameIndex) =>
        name.classList.toggle("is-active", nameIndex === index),
    );
    sliders.forEach(
        (slider) => (slider.style.transform = `translateY(${-index * 20}%)`),
    );
}

function updateDial(progress) {
    activeRing.style.setProperty("--angle", `${progress * 360}deg`);
    const index = Math.min(
        names.length - 1,
        Math.floor(progress * names.length),
    );
    if (index !== activeIndex) setActive(index);
}

gsap.to(sequence, {
    frame: frameCount - 1,
    ease: "none",
    onUpdate: drawFrame,
    scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.4,
    },
});

ScrollTrigger.create({
    trigger: stage,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => updateDial(self.progress),
});

new ResizeObserver(resizeCanvas).observe(canvas);
