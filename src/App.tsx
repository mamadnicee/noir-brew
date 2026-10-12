import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, Coffee, Languages, Minus, Plus, RotateCcw, ShoppingBag, Trash2 } from "lucide-react";
import { CoffeeScene, type ProjectedMarker } from "./scene/CoffeeScene";
import { stops, type Zone } from "./data/cameraStops";
import { products } from "./data/products";
import SciencePanel, { type ScienceFact } from "./components/SciencePanel";

type Cart = Record<string, number>;
const faTitles: Record<Zone, string> = { opening: "آیین", origin: "خاستگاه", menu: "منو", lab: "آزمایشگاه", visit: "دیدار" };

export default function App() {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<CoffeeScene | null>(null);
  const [zone, setZone] = useState<Zone>("opening");
  const [markers, setMarkers] = useState<ProjectedMarker[]>([]);
  const [status, setStatus] = useState("Preparing the scene…");
  const [cart, setCart] = useState<Cart>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "fa">("en");
  const [query, setQuery] = useState("");
  const [fact, setFact] = useState<ScienceFact | null>(null);

  useEffect(() => {
    if (!host.current) return;
    scene.current = new CoffeeScene(host.current, setZone, setStatus, setMarkers);
    return () => { scene.current?.dispose(); scene.current = null; };
  }, []);

  const stop = stops[Math.max(0, stops.findIndex(s => s.id === zone))];
  const active = stop.products.map(id => products.find(p => p.id === id)!).filter(Boolean);
  const filtered = useMemo(() => { const q = query.toLowerCase().trim(); return q ? active.filter(p => `${p.name} ${p.note} ${p.fa}`.toLowerCase().includes(q)) : active; }, [query, active]);
  const qty = Object.values(cart).reduce((a, b) => a + b, 0);
  const subtotal = products.reduce((t, p) => t + p.price * (cart[p.id] || 0), 0);
  const fa = lang === "fa";

  const add = (id: string) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const change = (id: string, d: number) => setCart(c => { const n = { ...c }; const v = (n[id] || 0) + d; if (v <= 0) delete n[id]; else n[id] = v; return n; });
  const goTo = (z: Zone) => { scene.current?.goTo(z); setFact(null); };

  return (
    <main className={`experience zone-${zone}`} dir={fa ? "rtl" : "ltr"}>
      <div className="scene-host" ref={host} />
      <div className="grain" />

      <header className="topbar">
        <button className="brand" type="button" onClick={() => goTo("opening")}>
          <span className="brand-mark"><Coffee size={18} /></span>
          <span>NOIR <i>BREW</i><small>COFFEE HOUSE · EST. 2018</small></span>
        </button>
        <nav className="main-nav" aria-label="Main navigation">
          {stops.map(s => (
            <button key={s.id} type="button" onClick={() => goTo(s.id)} aria-current={zone === s.id ? "page" : undefined}>
              {s.label}{fa ? ` · ${faTitles[s.id]}` : ""}
            </button>
          ))}
        </nav>
        <div className="topbar-actions">
          <button className="icon-button" type="button" onClick={() => setLang(l => (l === "en" ? "fa" : "en"))} aria-label="Toggle language">
            <Languages size={16} /> {fa ? "EN" : "فا"}
          </button>
          <button className="cart-trigger" type="button" onClick={() => setCartOpen(true)}>
            <ShoppingBag size={18} /><span>{fa ? "سبد" : "Bag"}</span><b>{String(qty).padStart(2, "0")}</b>
          </button>
        </div>
      </header>

      <div className="content-wrap">
        <section className="hero-copy" key={zone} aria-live="polite">
          <div className="eyebrow"><span />{stop.eyebrow}</div>
          <h1><span>{stop.title}</span><span>{fa ? faTitles[zone] : stop.copy}</span></h1>
          <p>{fa ? stop.copy : stop.detail}</p>

          {zone === "menu" || zone === "origin" || zone === "visit" ? (
            <div className="menu-tools">
              {zone === "menu" && (
                <label className="search-box">
                  <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={fa ? "جست‌وجوی منو…" : "Search the menu…"} aria-label="Search the menu" />
                </label>
              )}
              <div className="product-list">
                {filtered.map((product, i) => (
                  <article className="product-row" key={product.id}>
                    <span className="product-number">{String(i + 1).padStart(2, "0")}</span>
                    <div className="product-info">
                      <small>{product.kind} · {product.fa}</small>
                      <h3>{product.name}</h3>
                      <p>{product.note} — {product.description}</p>
                    </div>
                    <strong>${product.price.toFixed(2)}</strong>
                    <button className="add-button" type="button" onClick={() => add(product.id)} aria-label={`Add ${product.name} to bag`}><Plus size={16} /></button>
                  </article>
                ))}
                {filtered.length === 0 && <p className="empty-search">{fa ? "چیزی پیدا نشد." : "No drinks found."}</p>}
              </div>
            </div>
          ) : (
            <button className="primary-cta" type="button" onClick={() => goTo(zone === "opening" ? "origin" : "visit")}>
              {zone === "opening" ? (fa ? "کشف منو" : "Explore the menu") : (fa ? "مشاهدهٔ تجربه" : "See the experience")}<ArrowRight size={16} />
            </button>
          )}

          <div className="zone-science">
            <div className="eyebrow"><span />{fa ? "علم فنجان" : "CUP SCIENCE"}</div>
            {stop.science.map(s => (
              <article key={s.title}><h3>{s.title}</h3><p>{s.body}</p></article>
            ))}
          </div>
          <div className="hero-meta"><span>{String(stops.findIndex(s => s.id === zone) + 1).padStart(2, "0")} — {String(stops.length).padStart(2, "0")}</span><span>{stop.label}</span></div>
        </section>
      </div>

      <div className="station-layer" aria-label="Model markers">
        {markers.map(m => (
          <button key={m.id} type="button" className="station-marker" style={{ left: m.screenX, top: m.screenY, opacity: m.visible ? 1 : 0, pointerEvents: m.visible ? "auto" : "none" }}
            onClick={() => { scene.current?.selectMarker(m.id); const def = stop.markers.find(x => x.id === m.id); if (def) setFact({ id: def.id, title: def.fact.title, body: def.fact.body }); }}
            aria-label={m.label}>
            <span className="station-ring" /><span className="station-label">{m.label}</span>
          </button>
        ))}
      </div>

      <div className="canvas-hint" aria-hidden="true"><span>DRAG TO ORBIT · SCROLL TO ZONE</span><ArrowDown size={14} /></div>

      <footer className="bottom-bar">
        <div className="location"><i>◎</i> OPEN DAILY · 7AM—5PM <span className="live-dot" /></div>
        <div className="zone-controls">
          <button type="button" onClick={() => scene.current?.previous()} aria-label="Previous zone"><ArrowLeft size={16} /></button>
          <div className="progress-dots">{stops.map(s => <button key={s.id} type="button" className={zone === s.id ? "active" : ""} onClick={() => goTo(s.id)} aria-label={`Go to ${s.label}`} />)}</div>
          <button type="button" onClick={() => scene.current?.next()} aria-label="Next zone"><ArrowRight size={16} /></button>
          <button type="button" onClick={() => scene.current?.reset()} aria-label="Reset camera"><RotateCcw size={16} /></button>
        </div>
        <button className="scroll-hint" type="button" onClick={() => scene.current?.next()}>{fa ? "اسکرول برای کاوش" : "SCROLL TO EXPLORE"}<ArrowDown size={14} /></button>
      </footer>

      <div className="scene-fallback" role="status">{status}</div>

      {cartOpen && (
        <div className="drawer-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setCartOpen(false); }}>
          <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping bag">
            <div className="drawer-head"><div><span className="eyebrow">{fa ? "سبد خرید" : "YOUR BAG"}</span><h2>{fa ? "سبد شما" : "Your bag"}</h2></div>
              <button type="button" className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close bag">×</button></div>
            <div className="cart-items">
              {products.filter(p => cart[p.id]).map(p => (
                <article className="cart-item" key={p.id}>
                  <div className="cart-item-copy"><small>{p.kind}</small><h3>{p.name}</h3><span>${p.price.toFixed(2)} each</span></div>
                  <div className="quantity"><button type="button" onClick={() => change(p.id, -1)} aria-label={`Decrease ${p.name}`}><Minus size={14} /></button><span>{cart[p.id]}</span><button type="button" onClick={() => change(p.id, 1)} aria-label={`Increase ${p.name}`}><Plus size={14} /></button></div>
                  <button className="remove-item" type="button" onClick={() => change(p.id, -cart[p.id])} aria-label={`Remove ${p.name}`}><Trash2 size={16} /></button>
                </article>
              ))}
              {qty === 0 && <div className="empty-cart"><p>{fa ? "سبد شما خالی است." : "Your bag is empty."}</p></div>}
            </div>
            <div className="cart-summary">
              <div><span>{fa ? "جمع کل" : "Subtotal"}</span><strong>${subtotal.toFixed(2)}</strong></div>
              <small>{fa ? "این یک نمایش آزمایشی است؛ درگاه پرداخت واقعی وجود ندارد." : "Demo only — no real payment is processed."}</small>
            </div>
          </aside>
        </div>
      )}

      <SciencePanel open={!!fact} fact={fact} onClose={() => setFact(null)} />
    </main>
  );
}
