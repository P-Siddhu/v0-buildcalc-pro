"use client"

import * as React from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, OrbitControls, PerspectiveCamera, ContactShadows, Html } from "@react-three/drei"
import * as THREE from "three"

export type House3DOpening = {
  id: string
  type: "door" | "window" | "sliding" | "double" | "ventilator"
  wall: "top" | "right" | "bottom" | "left"
  offset: number
  width: number
  height: number
  sillHeight?: number
}

export type House3DRoom = {
  id: string
  name: string
  length: number
  width: number
  unit: "ft" | "m"
  x: number
  y: number
  openings?: House3DOpening[]
}

type Props = {
  rooms: House3DRoom[]
  plotLength: number
  plotWidth: number
  unit: "ft" | "m"
}

type Settings = {
  wallHeight: number
  wallThickness: number
  slabThickness: number
  showRoof: boolean
  showFloors: boolean
  wallColor: string
  floorColor: string
}

const DEFAULT_SETTINGS: Settings = {
  wallHeight: 10,
  wallThickness: 0.35,
  slabThickness: 0.45,
  showRoof: true,
  showFloors: true,
  wallColor: "#e4ddd2",
  floorColor: "#bba78e",
}

function toFeet(value: number, unit: "ft" | "m") {
  return unit === "m" ? value / 0.3048 : value
}

function HouseModel({ rooms, plotLength, plotWidth, unit, settings, selectedId, onSelect }: Props & { settings: Settings; selectedId: string | null; onSelect: (id: string) => void }) {
  const scale = 1
  const plotX = toFeet(plotLength, unit)
  const plotZ = toFeet(plotWidth, unit)
  const getRoom = (room: House3DRoom) => ({
    x: (room.x / 96) * plotX - plotX / 2,
    z: (room.y / 66) * plotZ - plotZ / 2,
    width: toFeet(room.length, room.unit as "ft" | "m"),
    depth: toFeet(room.width, room.unit as "ft" | "m"),
  })

  const walls: { key: string; x: number; z: number; length: number; horizontal: boolean; roomId: string; opening?: House3DOpening }[] = []
  const seen = new Set<string>()
  rooms.forEach((room) => {
    const r = getRoom(room)
    const edges = [
      { side: "top" as const, x: r.x + r.width / 2, z: r.z, length: r.width, horizontal: true },
      { side: "bottom" as const, x: r.x + r.width / 2, z: r.z + r.depth, length: r.width, horizontal: true },
      { side: "left" as const, x: r.x, z: r.z + r.depth / 2, length: r.depth, horizontal: false },
      { side: "right" as const, x: r.x + r.width, z: r.z + r.depth / 2, length: r.depth, horizontal: false },
    ]
    edges.forEach((edge) => {
      const key = `${edge.horizontal ? "h" : "v"}:${edge.x.toFixed(3)}:${edge.z.toFixed(3)}:${edge.length.toFixed(3)}`
      if (seen.has(key)) return
      seen.add(key)
      const opening = (room.openings ?? []).find((item) => item.wall === edge.side)
      walls.push({ key, x: edge.x, z: edge.z, length: edge.length, horizontal: edge.horizontal, roomId: room.id, opening })
    })
  })

  return <>
    <color attach="background" args={["#d8d5cf"]} />
    <ambientLight intensity={1.1} />
    <directionalLight position={[20, 28, 12]} intensity={2.2} castShadow shadow-mapSize={[2048, 2048]} />
    <Environment preset="studio" />
    <group scale={[scale, scale, scale]}>
      <mesh position={[0, -settings.slabThickness / 2, 0]} receiveShadow>
        <boxGeometry args={[plotX + 8, settings.slabThickness, plotZ + 8]} />
        <meshStandardMaterial color="#a9a49c" roughness={0.95} />
      </mesh>
      {settings.showFloors && rooms.map((room) => {
        const r = getRoom(room)
        return <mesh key={`floor-${room.id}`} position={[r.x + r.width / 2, 0, r.z + r.depth / 2]} receiveShadow onClick={() => onSelect(room.id)}>
          <boxGeometry args={[r.width, 0.18, r.depth]} />
          <meshStandardMaterial color={selectedId === room.id ? "#c8e66d" : settings.floorColor} roughness={0.8} />
        </mesh>
      })}
      {walls.map((wall) => {
        const height = settings.wallHeight
        const opening = wall.opening
        const openingWidth = opening ? toFeet(opening.width, unit) : 0
        const openingHeight = opening ? Math.min(height, toFeet(opening.height, unit)) : 0
        const lower = opening?.type === "window" || opening?.type === "ventilator" ? Math.max(0, toFeet(opening.sillHeight ?? 3, unit)) : 0
        const segment = (width: number, centerOffset: number, y: number, h: number) => <mesh key={`${wall.key}-${width}-${y}`} position={[wall.horizontal ? wall.x + centerOffset : wall.x, y, wall.horizontal ? wall.z : wall.z + centerOffset]} castShadow receiveShadow onClick={() => onSelect(wall.roomId)}>
          <boxGeometry args={[wall.horizontal ? width : settings.wallThickness, h, wall.horizontal ? settings.wallThickness : width]} />
          <meshStandardMaterial color={selectedId === wall.roomId ? "#d4ff3f" : settings.wallColor} roughness={0.72} />
        </mesh>
        if (!opening || openingWidth <= 0 || openingWidth >= wall.length - 0.2) return segment(wall.length, 0, height / 2, height)
        const center = Math.min(wall.length - openingWidth / 2, Math.max(openingWidth / 2, opening.offset)) - wall.length / 2
        const parts: React.ReactNode[] = []
        const left = wall.length / 2 + center - openingWidth / 2
        const right = wall.length - left - openingWidth
        if (left > 0.05) parts.push(segment(left, -wall.length / 2 + left / 2, height / 2, height))
        if (right > 0.05) parts.push(segment(right, wall.length / 2 - right / 2, height / 2, height))
        if (lower > 0.05) parts.push(segment(openingWidth, center, lower / 2, lower))
        if (height - (lower + openingHeight) > 0.05) parts.push(segment(openingWidth, center, lower + openingHeight + (height - lower - openingHeight) / 2, height - lower - openingHeight))
        return <React.Fragment key={wall.key}>{parts}</React.Fragment>
      })}
      {settings.showRoof && <mesh position={[0, settings.wallHeight + 0.4, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <boxGeometry args={[Math.max(plotX * 0.9, 1), 0.65, Math.max(plotZ * 0.9, 1)]} />
        <meshStandardMaterial color="#5a4f49" roughness={0.9} />
      </mesh>}
      {selectedId && <Html position={[0, settings.wallHeight + 1.3, 0]} center><div className="rounded-md border border-white/30 bg-[#17151C]/90 px-2 py-1 text-xs text-white shadow-lg">{rooms.find((room) => room.id === selectedId)?.name}</div></Html>}
    </group>
    <ContactShadows position={[0, 0, 0]} opacity={0.32} scale={Math.max(plotX, plotZ) * 1.5} blur={2.5} far={20} />
  </>
}

export function House3DView({ rooms, plotLength, plotWidth, unit }: Props) {
  const [settings, setSettings] = React.useState(DEFAULT_SETTINGS)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const controls = React.useRef<any>(null)
  const resetView = () => { controls.current?.reset() }
  return <div className="overflow-hidden rounded-2xl border border-border/70 bg-[#d8d5cf]" data-testid="house-3d-view">
    <div className="flex flex-wrap items-center gap-2 border-b border-black/10 bg-[#17151C] p-2 text-white">
      <span className="mr-auto text-xs font-semibold uppercase tracking-[0.16em]">3D House · geometry preview</span>
      <button className="rounded-md bg-white/10 px-2 py-1 text-xs hover:bg-white/20" onClick={() => setSettings((value) => ({ ...value, showRoof: !value.showRoof }))}>Roof {settings.showRoof ? "on" : "off"}</button>
      <button className="rounded-md bg-white/10 px-2 py-1 text-xs hover:bg-white/20" onClick={() => setSettings((value) => ({ ...value, showFloors: !value.showFloors }))}>Floors {settings.showFloors ? "on" : "off"}</button>
      <button className="rounded-md bg-white/10 px-2 py-1 text-xs hover:bg-white/20" onClick={resetView}>Reset view</button>
      <label className="flex items-center gap-1 text-xs">Wall <input aria-label="Wall color" type="color" value={settings.wallColor} onChange={(event) => setSettings((value) => ({ ...value, wallColor: event.target.value }))} /></label>
    </div>
    <div className="h-[min(68vh,620px)] min-h-[360px] w-full">
      <Canvas shadows dpr={[1, 1.5]} fallback={<div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">WebGL is unavailable in this browser. The 2D planner remains available.</div>}>
        <PerspectiveCamera makeDefault position={[Math.max(plotLength, 25), Math.max(plotWidth, 20), Math.max(plotLength, 25)]} fov={42} />
        <OrbitControls ref={controls} makeDefault enableDamping minDistance={8} maxDistance={120} />
        <HouseModel rooms={rooms} plotLength={plotLength} plotWidth={plotWidth} unit={unit} settings={settings} selectedId={selectedId} onSelect={setSelectedId} />
      </Canvas>
    </div>
    <div className="flex flex-wrap gap-3 border-t border-black/10 bg-white/70 px-3 py-2 text-[11px] text-slate-700"><span>Drag to orbit</span><span>Scroll or pinch to zoom</span><span>Right-drag to pan</span><span>Defaults: {settings.wallHeight} ft wall height · {settings.wallThickness} ft wall thickness</span></div>
  </div>
}
