import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, Coffee, Plus, ShoppingBag } from "lucide-react";
import { CoffeeScene } from "./scene/CoffeeScene";
import { stops, type Zone } from "./data/cameraStops";
import { products } from "./data/products";

type Cart = Record<string, number>;

const content: Record<
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
    title: "Find your other light.",
    body: "A little ritual for the hours that belong to you.",
    action: "Explore the menu",
  },
  collection: {
    eyebrow: "THE NOIR COLLECTION",
    title: "Made for the moment.",
    body: "Thoughtfully sourced coffee, roasted in small batches.",
    action: "Browse the collection",
  },
  lab: {
    eyebrow: "OUR CRAFT",
    title: "Good things take their time.",
    body: "Nothing rushed. Nothing to hide.",
    action: "Learn more",
  },
  journal: {
    eyebrow: "NOTES FROM THE COUNTER",
    title: "A story in every cup.",
    body: "Origin notes, brewing rituals, and good coffee.",
    action: "Read our notes",
  },
  visit: {
    eyebrow: "YOUR TABLE IS WAITING",
    title: "Meet us in the quiet.",
    body: "Come in for a cup and stay for the slower pace.",
    action: "Plan a visit",
  },
};

export default function App() {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<CoffeeScene | null>(null);

  const [zone, setZone] = useState<Zone>("opening");
  const [cart, setCart] = useState<Cart>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!host.current) return;

    scene.current = new CoffeeScene(host.current, setZone, () => undefined);

    return () => {
      scene.current?.dispose();
      scene.current = null;
    };
  }, []);

  const totalQuantity = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0,
  );

  const subtotal = products.reduce(
    (total, product) => total + product.price * (cart[product.id] || 0),
    0,
  );

  const filteredProducts = useMemo(() => {
    const search = query.toLowerCase().trim();

    if (!search) return products;

    return products.filter((product) =>
      `${product.name} ${product.note} ${product.kind}`
        .toLowerCase()
        .includes(search),
    );
  }, [query]);

  function addToCart(id: string) {
    setCart((current) => ({
      ...current,
      [id]: (current[id] || 0) + 1,
    }));
  }

  function changeQuantity(id: string, amount: number) {
    setCart((current) => {
      const next = { ...current };
      const quantity = (next[id] || 0) + amount;

      if (quantity <= 0) {
        delete next[id];
      } else {
        next[id] = quantity;
      }

      return next;
    });
  }

  function goTo(nextZone: Zone) {
    scene.current?.goTo(nextZone);
    setZone(nextZone);
  }

  const currentIndex = Math.max(
    0,
    stops.findIndex((stop) => stop.id === zone),
  );

  const panel = content[zone];

  return (
    <>
      <main className={`experience zone-${zone}`}>
        <div className="scene-host" ref={host} />

        <header className="topbar">
          <button
            className="brand"
            type="button"
            onClick={() => goTo("opening")}
          >
            <span className="brand-mark">
              <Coffee size={18} />
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
                onClick={() => goTo(stop.id)}
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
          >
            <ShoppingBag size={18} />
            <span>Bag</span>
            <b>{String(totalQuantity).padStart(2, "0")}</b>
          </button>
        </header>

        <div className="content-wrap">
          <section className="hero-copy" aria-live="polite">
            <div className="eyebrow">
              <span />
              {panel.eyebrow}
            </div>

            <h1>{panel.title}</h1>
            <p>{panel.body}</p>

            {zone === "collection" ? (
              <div className="menu-tools">
                <label className="search-box">
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search the menu"
                    aria-label="Search the menu"
                  />
                </label>

                <div className="product-list">
                  {filteredProducts.map((product) => (
                    <article className="product-row" key={product.id}>
                      <div className="product-info">
                        <small>{product.kind}</small>
                        <h3>{product.name}</h3>
                        <p>{product.note}</p>
                      </div>

                      <strong>${product.price.toFixed(2)}</strong>

                      <button
                        className="add-button"
                        type="button"
                        onClick={() => addToCart(product.id)}
                        aria-label={`Add ${product.name} to bag`}
                      >
                        <Plus size={16} />
                      </button>
                    </article>
                  ))}

                  {filteredProducts.length === 0 && (
                    <p>No drinks found.</p>
                  )}
                </div>
              </div>
            ) : (
              <button
                className="primary-cta"
                type="button"
                onClick={() =>
                  goTo(zone === "opening" ? "collection" : "visit")
                }
              >
                {panel.action}
                <ArrowRight size={16} />
              </button>
            )}

            <div className="hero-meta">
              <span>
                {String(currentIndex + 1).padStart(2, "0")} —{" "}
                {String(stops.length).padStart(2, "0")}
              </span>
              <span>{stops[currentIndex]?.label}</span>
            </div>
          </section>
        </div>

        <footer className="bottom-bar">
          <div className="location">OPEN DAILY · 7AM—5PM</div>

          <div className="zone-controls">
            <button
              type="button"
              onClick={() => scene.current?.previous()}
              aria-label="Previous section"
            >
              <ArrowLeft size={16} />
            </button>

            <div className="progress-dots">
              {stops.map((stop) => (
                <button
                  key={stop.id}
                  type="button"
                  className={zone === stop.id ? "active" : ""}
                  onClick={() => goTo(stop.id)}
                  aria-label={`Go to ${stop.label}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => scene.current?.next()}
              aria-label="Next section"
            >
              <ArrowRight size={16} />
            </button>
          </div>

          <button
            className="scroll-hint"
            type="button"
            onClick={() => scene.current?.next()}
          >
            SCROLL TO EXPLORE
            <ArrowDown size={14} />
          </button>
        </footer>

        {cartOpen && (
          <div
            className="drawer-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setCartOpen(false);
              }
            }}
          >
            <aside
              className="cart-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Shopping bag"
            >
              <div className="drawer-head">
                <h2>Your bag</h2>

                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  aria-label="Close bag"
                >
                  ×
                </button>
              </div>

              <div className="cart-items">
                {products
                  .filter((product) => cart[product.id])
                  .map((product) => (
                    <article className="cart-item" key={product.id}>
                      <div>
                        <h3>{product.name}</h3>
                        <span>${product.price.toFixed(2)} each</span>
                      </div>

                      <div className="quantity">
                        <button
                          type="button"
                          onClick={() => changeQuantity(product.id, -1)}
                        >
                          −
                        </button>

                        <span>{cart[product.id]}</span>

                        <button
                          type="button"
                          onClick={() => changeQuantity(product.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </article>
                  ))}

                {totalQuantity === 0 && <p>Your bag is empty.</p>}
              </div>

              <div className="cart-summary">
                <strong>Subtotal: ${subtotal.toFixed(2)}</strong>
              </div>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}
