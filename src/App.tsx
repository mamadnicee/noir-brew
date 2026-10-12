import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Coffee,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { CoffeeScene } from "./scene/CoffeeScene";
import { stops, type Zone } from "./data/cameraStops";
import { products } from "./data/products";
import SciencePanel, { type ScienceFact } from "./components/SciencePanel";
import type { StationMarker } from "./scene/CoffeeScene";

type Cart = Record<string, number>;

const stationFacts: Record<string, ScienceFact> = {
  core: {
    id: "core",
    title: "The Extraction Core",
    body:
      "Water at 93°C meets freshly ground beans here. Pressure, temperature and time are balanced so every cup pulls clean, sweet and balanced.",
  },
  bloom: {
    id: "bloom",
    title: "The Bloom Chamber",
    body:
      "Freshly roasted coffee releases CO₂ on first contact with water — the bloom. Letting it breathe before the pour unlocks aroma and even extraction.",
  },
  thermal: {
    id: "thermal",
    title: "The Thermal Loop",
    body:
      "Heat is circulated, never wasted. Stable brew temperature from first drop to last keeps every cup consistent.",
  },
};

const copy: Record<
  Zone,
  {
    eyebrow: string;
    title: string;
    body: string;
    action: string;
  }
> = {
  opening: {
    eyebrow: "A QUIETER KIND OF COFFEE",
    title: "Find your\nother light.",
    body:
      "A little ritual for the hours that belong to you. Thoughtfully sourced, slowly made, always worth the pause.",
    action: "Explore the menu",
  },
  collection: {
    eyebrow: "THE NOIR COLLECTION",
    title: "Made for\nthe moment.",
    body:
      "From velvet espresso to a slow-bloom filter, find your next favorite in our small-batch collection.",
    action: "Browse the collection",
  },
  lab: {
    eyebrow: "OUR CRAFT, WITHOUT THE NOISE",
    title: "Good things\ntake their time.",
    body:
      "We work with thoughtful growers and roast in small, considered batches. Nothing rushed. Nothing to hide.",
    action: "A little more about us",
  },
  journal: {
    eyebrow: "NOTES FROM THE COUNTER",
    title: "A story in\nevery cup.",
    body:
      "Origin notes, brewing rituals, and the people behind the beans. A few things worth lingering over.",
    action: "Read our notes",
  },
  visit: {
    eyebrow: "YOUR TABLE IS WAITING",
    title: "Meet us\nin the quiet.",
    body:
      "Come in for a cup, stay for the slower pace. Find our neighborhood counter and make yourself at home.",
    action: "Plan a visit",
  },
};

export default function App() {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<CoffeeScene | null>(null);

  const [zone, setZone] = useState<Zone>("opening");
  const [webglError, setWebglError] = useState(false);
  const [cart, setCart] = useState<Cart>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [markers, setMarkers] = useState<StationMarker[]>([]);
  const [fact, setFact] = useState<ScienceFact | null>(null);

  useEffect(() => {
    if (!host.current) return;

    try {
      scene.current = new CoffeeScene(
        host.current,
        setZone,
        () => setWebglError(true),
        setMarkers,
      );
    } catch {
      setWebglError(true);
    }

    return () => {
      scene.current?.dispose();
      scene.current = null;
    };
  }, []);

  const totalQty = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);

  const subtotal = products.reduce(
    (sum, product) => sum + product.price * (cart[product.id] || 0),
    0,
  );

  const kinds = [
    "All",
    ...Array.from(new Set(products.map((product) => product.kind))),
  ];

  const filtered = useMemo(() => {
    const normalizedQuery = query.toLowerCase();

    return products.filter((product) => {
      const matchesFilter = filter === "All" || product.kind === filter;
      const searchableText =
        `${product.name} ${product.note} ${product.kind}`.toLowerCase();

      return matchesFilter && searchableText.includes(normalizedQuery);
    });
  }, [filter, query]);

  function add(id: string) {
    setCart((current) => ({
      ...current,
      [id]: (current[id] || 0) + 1,
    }));
  }

  function change(id: string, amount: number) {
    setCart((current) => {
      const quantity = (current[id] || 0) + amount;
      const next = { ...current };

      if (quantity <= 0) {
        delete next[id];
      } else {
        next[id] = quantity;
      }

      return next;
    });
  }

  const current = stops.findIndex((stop) => stop.id === zone);
  const panel = copy[zone];

  function choose(nextZone: Zone) {
    scene.current?.goTo(nextZone);
    setZone(nextZone);
  }

  return (
    <>
      <main className={`experience zone-${zone}`}>
        <div className="scene-host" ref={host} aria-hidden="false" />

        {webglError && (
          <div className="scene-fallback" role="status">
            The 3D view is unavailable on this device. You can still explore
            Noir Brew.
          </div>
        )}

        <div className="grain" aria-hidden="true" />

        <div className="station-layer" aria-hidden="true">
          {markers
            .filter((marker) => marker.visible)
            .map((marker) => (
              <button
                key={marker.id}
                type="button"
                className="station-marker"
                style={{
                  left: marker.screenX,
                  top: marker.screenY,
                }}
                aria-hidden="false"
                onClick={() =>
                  setFact(stationFacts[marker.id] ?? null)
                }
                title={marker.label}
              >
                <span className="station-ring" />
                <span className="station-label">{marker.label}</span>
              </button>
            ))}
        </div>

        <header className="topbar">
          <button
            className="brand"
            type="button"
            onClick={() => choose("opening")}
            aria-label="Noir Brew home"
          >
            <span className="brand-mark">
              <Coffee size={19} />
            </span>

            <span>
              NOIR <i>BREW</i>
              <small>COFFEE HOUSE · EST. 2018</small>
            </span>
          </button>

          <nav className="main-nav" aria-label="Main navigation">
            {stops.map((stop) => (
              <button
                key={stop.id}
                type="button"
                onClick={() => choose(stop.id)}
                aria-current={zone === stop.id ? "page" : undefined}
              >
                {stop.label}
              </button>
            ))}
          </nav>

          <button
            className="cart-trigger"
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`Open bag, ${totalQty} items`}
          >
            <ShoppingBag size={18} />
            <span>Bag</span>
            <b>{String(totalQty).padStart(2, "0")}</b>
          </button>
        </header>

        <div className="content-wrap">
          <section
            className="hero-copy"
            key={zone}
            aria-live="polite"
            aria-labelledby="panel-title"
          >
            <div className="eyebrow">
              <span />
              {panel.eyebrow}
            </div>

            <h1 id="panel-title">
              {panel.title.split("\n").map((line, index) => (
                <span key={index}>{line}</span>
              ))}
            </h1>

            <p>{panel.body}</p>

            {zone === "collection" ? (
              <div className="menu-tools">
                <label className="search-box">
                  <Search size={16} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search 
