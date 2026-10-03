import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer, useTexture } from "@react-three/drei";
import { ArrowRight, BadgeCheck, MessageCircle, Plus, ShieldCheck, Sparkles, Store, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Group, Mesh } from "three";
import { Button } from "@/components/ui/button";
import { SiteShell } from "./site-shell";
import earthDayUrl from "@/assets/earth_atmos_2048.jpg";
import earthCloudsUrl from "@/assets/earth_clouds_1024.png";
import earthNormalUrl from "@/assets/earth_normal_2048.jpg";

const signals = [
  { label: "Verified sellers", copy: "Clear profiles and transparent listing details.", icon: BadgeCheck },
  { label: "Direct connection", copy: "Move from discovery to a real conversation in one tap.", icon: MessageCircle },
  { label: "Made for Kenya", copy: "Local discovery, familiar payments and nationwide reach.", icon: ShieldCheck },
];

const SUN_POSITION: [number, number, number] = [2.15, 1.4, 2.0];

function makeGlowTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255, 214, 150, 1)");
  gradient.addColorStop(0.22, "rgba(255, 176, 90, 0.55)");
  gradient.addColorStop(0.5, "rgba(255, 138, 36, 0.18)");
  gradient.addColorStop(1, "rgba(255, 122, 31, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function Sun() {
  const glow = useMemo(makeGlowTexture, []);
  return <group position={SUN_POSITION}>
    <mesh>
      <sphereGeometry args={[0.7, 48, 48]} />
      <meshBasicMaterial color="#fff3d0" toneMapped={false} />
    </mesh>
    <sprite scale={[4.0, 4.0, 1]}>
      <spriteMaterial map={glow} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} opacity={0.75} />
    </sprite>
    <pointLight intensity={42} distance={40} decay={2} color="#ffd9a0" />
  </group>;
}

function Earth() {
  const [day, clouds, normal] = useTexture([earthDayUrl, earthCloudsUrl, earthNormalUrl]) as [THREE.Texture, THREE.Texture, THREE.Texture];
  day.colorSpace = THREE.SRGBColorSpace;
  clouds.colorSpace = THREE.SRGBColorSpace;
  const surface = useRef<Mesh>(null);
  const cloudLayer = useRef<Mesh>(null);
  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    if (surface.current) surface.current.rotation.y += delta * 0.1;
    if (cloudLayer.current) cloudLayer.current.rotation.y += delta * 0.135;
  });
  return <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.45}>
    <group>
      <mesh ref={surface}>
        <sphereGeometry args={[1.75, 64, 64]} />
        <meshStandardMaterial map={day} normalMap={normal} normalScale={[0.9, 0.9]} metalness={0.05} roughness={0.8} />
      </mesh>
      <mesh ref={cloudLayer} scale={1.015}>
        <sphereGeometry args={[1.75, 48, 48]} />
        <meshStandardMaterial map={clouds} transparent opacity={0.5} depthWrite={false} roughness={1} />
      </mesh>
      <mesh scale={1.14}>
        <sphereGeometry args={[1.75, 48, 48]} />
        <meshBasicMaterial color="#7fe3c9" transparent opacity={0.09} blending={THREE.AdditiveBlending} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  </Float>;
}

function MoonOrbit() {
  const moon = useRef<Group>(null);
  useFrame(({ clock }) => {
    const angle = clock.elapsedTime * 0.4;
    moon.current?.position.set(Math.cos(angle) * 2.65, Math.sin(angle * 0.8) * 0.4, Math.sin(angle) * 2.65);
  });
  return <>
    <mesh rotation={[Math.PI / 2 - 0.25, 0.2, 0]}>
      <torusGeometry args={[2.65, 0.014, 10, 160]} />
      <meshBasicMaterial color="#5ce3a3" transparent opacity={0.4} />
    </mesh>
    <group ref={moon}>
      <mesh>
        <sphereGeometry args={[0.24, 32, 32]} />
        <meshStandardMaterial color="#d7dde2" roughness={0.95} metalness={0} />
      </mesh>
    </group>
  </>;
}

function SolarSystem() {
  const group = useRef<Group>(null);
  const { pointer } = useThree();
  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    if (!group.current) return;
    group.current.rotation.y += delta * 0.06;
    group.current.rotation.x += (pointer.y * 0.16 - group.current.rotation.x) * (1 - Math.exp(-3 * delta));
    group.current.rotation.z += (-pointer.x * 0.1 - group.current.rotation.z) * (1 - Math.exp(-3 * delta));
  });
  return <group ref={group} rotation={[0.14, -0.35, 0]}>
    <Sun />
    <Earth />
    <MoonOrbit />
  </group>;
}

function HeroScene() {
  return <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 8], fov: 42 }} gl={{ antialias: true, alpha: true }}>
    <ambientLight intensity={1.05} />
    <directionalLight position={SUN_POSITION} intensity={2.8} color="#ffe6bf" />
    <directionalLight position={[-4, 1, 6]} intensity={0.7} color="#9fd9c2" />
    <pointLight position={[-6, -3, 4]} intensity={12} color="#1bbf83" />
    <Suspense fallback={null}>
      <SolarSystem />
    </Suspense>
    <Environment resolution={128}>
      <Lightformer intensity={3} position={[0, 5, 2]} scale={[8, 3, 1]} />
      <Lightformer intensity={2} color="#52d99b" position={[-5, 0, 1]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
    </Environment>
  </Canvas>;
}

export function Home3D() {
  const [signal, setSignal] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setSignal((value) => (value + 1) % signals.length), 3400);
    return () => window.clearInterval(timer);
  }, []);
  const active = signals[signal] ?? signals[0];
  if (!active) return null;
  const ActiveIcon = active.icon;

  return <SiteShell>
    <section className="home-space relative isolate overflow-hidden bg-surface-strong text-surface-foreground">
      <div className="home-orbit-grid absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-surface-strong to-transparent" />
      <div className="relative mx-auto grid min-h-[calc(100svh-4.5rem)] max-w-7xl items-center gap-4 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:py-16">
        <div className="relative z-10 min-w-0 animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary backdrop-blur-xl"><Sparkles className="size-3.5" /> The marketplace in motion</span>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.02] sm:text-6xl lg:text-7xl">Discover more.<br/><span className="home-shine">Trade beyond.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-surface-muted sm:text-lg">VRUMEVER brings buyers and sellers together through trusted listings, direct conversations and effortless local discovery.</p>
          <div className="mt-8 grid max-w-md gap-3 sm:flex sm:max-w-none sm:flex-wrap"><Button asChild size="lg"><Link to="/auth" search={{ role: "buyer", mode: "login" }}>Explore marketplace <ArrowRight /></Link></Button><Button asChild size="lg" variant="glass"><Link to="/auth" search={{ role: "seller", mode: "login" }}><Plus /> Start selling</Link></Button></div>
          <div className="mt-10 flex items-center gap-4" aria-live="polite">
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/15 text-primary"><ActiveIcon className="size-5" /></span>
            <div key={active.label} className="animate-fade-in"><p className="font-display font-bold">{active.label}</p><p className="text-sm text-surface-muted">{active.copy}</p></div>
          </div>
          <div className="mt-5 flex gap-2" aria-label="Marketplace highlights">{signals.map((item,index)=><button key={item.label} type="button" onClick={()=>setSignal(index)} aria-label={`Show ${item.label}`} className={`h-1 rounded-full transition-all ${index===signal?"w-10 bg-primary":"w-4 bg-surface-muted/40"}`} />)}</div>
        </div>
        <div className="relative h-[340px] min-h-0 w-full sm:h-[480px] lg:h-[620px]" aria-hidden="true">
          <HeroScene />
          <div className="home-float-card absolute left-1 top-9 flex items-center gap-3 rounded-card border border-primary/25 bg-surface-strong/65 p-3 backdrop-blur-xl sm:left-4 sm:top-16"><span className="grid size-9 place-items-center rounded-md bg-primary/20 text-primary"><Store className="size-4" /></span><span><b className="block text-sm">List it</b><small className="text-surface-muted">Reach real buyers</small></span></div>
          <div className="home-float-card home-float-delay absolute bottom-10 right-0 flex items-center gap-3 rounded-card border border-primary/25 bg-surface-strong/65 p-3 backdrop-blur-xl sm:right-5"><span className="grid size-9 place-items-center rounded-md bg-primary/20 text-primary"><Zap className="size-4" /></span><span><b className="block text-sm">Find it</b><small className="text-surface-muted">Connect directly</small></span></div>
        </div>
      </div>
    </section>
    <section className="bg-surface-strong px-4 pb-20 text-surface-foreground sm:px-6 sm:pb-28">
      <div className="mx-auto max-w-7xl border-t border-primary/15 pt-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">One marketplace. Three simple moves.</p>
        <div className="mt-7 grid gap-px overflow-hidden rounded-card border border-primary/15 bg-primary/15 md:grid-cols-3">
          {[["01","Discover","Explore approved listings from sellers across Kenya."],["02","Connect","Talk directly through WhatsApp or a phone call."],["03","Trade","Make confident decisions with clear listing information."]].map(([number,title,copy])=><article key={number} className="group bg-surface-strong p-6 transition hover:bg-primary/10 sm:p-8"><span className="font-display text-sm font-bold text-primary">{number}</span><h2 className="mt-12 font-display text-2xl font-bold transition-transform group-hover:translate-x-1">{title}</h2><p className="mt-3 text-sm leading-6 text-surface-muted">{copy}</p></article>)}
        </div>
      </div>
    </section>
  </SiteShell>;
}