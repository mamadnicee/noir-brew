import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Coffee, Minus, Plus, Search, ShoppingBag, X } from "lucide-react";
import { CoffeeScene } from "./scene/CoffeeScene";
import { stops, type Zone } from "./data/cameraStops";
import { products } from "./data/products";

type Cart = Record<string, number>;
const copy: Record<Zone, {eyebrow:string;title:string;body:string;action:string}> = {
 opening:{eyebrow:"A QUIETER KIND OF COFFEE",title:"Find your
other light.",body:"A little ritual for the hours that belong to you. Thoughtfully sourced, slowly made, always worth the pause.",action:"Explore the menu"},
 collection:{eyebrow:"THE NOIR COLLECTION",title:"Made for
the moment.",body:"From velvet espresso to a slow-bloom filter, find your next favorite in our small-batch collection.",action:"Browse the collection"},
 lab:{eyebrow:"OUR CRAFT, WITHOUT THE NOISE",title:"Good things
take their time.",body:"We work with thoughtful growers and roast in small, considered batches. Nothing rushed. Nothing to hide.",action:"A little more about us"},
 journal:{eyebrow:"NOTES FROM THE COUNTER",title:"A story in
every cup.",body:"Origin notes, brewing rituals, and the people behind the beans. A few things worth lingering over.",action:"Read our notes"},
 visit:{eyebrow:"YOUR TABLE IS WAITING",title:"Meet us
in the quiet.",body:"Come in for a cup, stay for the slower pace. Find our neighborhood counter and make yourself at home.",action:"Plan a visit"}
};
export default function App(){
 const host=useRef<HTMLDivElement>(null),scene=useRef<CoffeeScene|null>(null);
 const [zone,setZone]=useState<Zone>("opening"),[webglError,setWebglError]=useState(false),[cart,setCart]=useState<Cart>({}),[cartOpen,setCartOpen]=useState(false),[query,setQuery]=useState(""),[filter,setFilter]=useState("All");
 useEffect(()=>{if(!host.current)return;try{scene.current=new CoffeeScene(host.current,setZone,()=>setWebglError(true))}catch{setWebglError(true)}return()=>{scene.current?.dispose();scene.current=null}},[]);
 const totalQty=Object.values(cart).reduce((a,b)=>a+b,0), subtotal=products.reduce((a,p)=>a+p.price*(cart[p.id]||0),0);
 const kinds=["All",...Array.from(new Set(products.map(p=>p.kind)))];
 const filtered=useMemo(()=>products.filter(p=>(filter==="All"||p.kind===filter)&&`${p.name} ${p.note} ${p.kind}`.toLowerCase().includes(query.toLowerCase())),[filter,query]);
 function add(id:string){setCart(c=>({...c,[id]:(c[id]||0)+1}))}
 function change(id:string,n:number){setCart(c=>{const q=(c[id]||0)+n;const next={...c};if(q<=0)delete next[id];else next[id]=q;return next})}
 const current=stops.findIndex(s=>s.id===zone),panel=copy[zone];
 function choose(z:Zone){scene.current?.goTo(z);setZone(z)}
 return <main className={`experience zone-${zone}`}>
  <div className="scene-host" ref={host} aria-hidden="false"/>
  {webglError&&<div className="scene-fallback" role="status">The 3D view is unavailable on this device. You can still explore Noir Brew.</div>}
  <div className="grain" aria-hidden="true"/><header className="topbar">
   <button className="brand" onClick={()=>choose("opening")} aria-label="Noir Brew home"><span className="brand-mark"><Coffee size={19}/></span><span>NOIR <i>BREW</i><small>COFFEE HOUSE · EST. 2018</small></span></button>
   <nav className="main-nav" aria-label="Main navigation">{stops.map(s=><button key={s.id} onClick={()=>choose(s.id)} aria-current={zone===s.id?"page":undefined}>{s.label}</button>)}</nav>
   <button className="cart-trigger" onClick={()=>setCartOpen(true)} aria-label={`Open bag, ${totalQty} items`}><ShoppingBag size={18}/><span>Bag</span><b>{String(totalQty).padStart(2,"0")}</b></button>
  </header>
  <div className="content-wrap">
   <section className="hero-copy" key={zone} aria-live="polite" aria-labelledby="panel-title">
    <div className="eyebrow"><span/>{panel.eyebrow}</div><h1 id="panel-title">{panel.title.split("\n").map((line,i)=><span key={i}>{line}</span>)}</h1><p>{panel.body}</p>
    {zone==="collection"?<div className="menu-tools"><label className="search-box"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search the menu" aria-label="Search the menu"/></label><div className="filter-row" aria-label="Filter menu">{kinds.map(k=><button className={filter===k?"selected":""} onClick={()=>setFilter(k)} key={k}>{k}</button>)}</div><div className="product-list">{filtered.map((p,i)=><article className="product-row" key={p.id}><div className="product-number">{p.id}</div><div className="product-info">{p.tag&&<small>{p.tag}</small>}<h3>{p.name}</h3><p>{p.note}</p></div><strong>${p.price.toFixed(2)}</strong><button className="add-button" aria-label={`Add ${p.name} to bag`} onClick={()=>add(p.id)}><Plus size={16}/></button></article>)}{!filtered.length&&<p className="empty-search">No drinks found. Try another search.</p>}</div></div>:<button className="primary-cta" onClick={()=>zone==="opening"?choose("collection"):zone==="visit"?setCartOpen(true):choose(zone==="lab"?"journal":"visit")}>{panel.action}<ArrowRight size={16}/></button>}
    <div className="hero-meta"><span>01 — 05</span><span>{stops[current]?.label.toUpperCase()}</span></div>
   </section>
   {zone==="opening"&&<aside className="side-note"><span>HOUSE BLEND · NO. 09</span><strong>Notes of<br/>cocoa &amp; cedar</strong><span>ROASTED SLOWLY, SERVED DAILY</span></aside>}
   {zone==="lab"&&<aside className="side-note"><span>SMALL BATCH, ALWAYS</span><strong>Origin first.<br/>People always.</strong><span>TRACEABLE · SEASONAL · CONSIDERED</span></aside>}
   {zone==="journal"&&<aside className="side-note"><span>FIELD NOTES / 04</span><strong>The beauty<br/>of a slow pour.</strong><span>READ · SIP · REPEAT</span></aside>}
   {zone==="visit"&&<aside className="side-note"><span>FIND YOUR WAY</span><strong>24 Alder Street<br/>Portland, OR</strong><span>DAILY · 7AM — 5PM</span></aside>}
  </div>
  <footer className="bottom-bar"><div className="location"><span className="live-dot"/>OPEN DAILY <i>·</i> 7AM—5PM</div><div className="zone-controls"><button onClick={()=>scene.current?.previous()} aria-label="Previous section"><ArrowLeft size={16}/></button><div className="progress-dots">{stops.map((s,i)=><button key={s.id} className={zone===s.id?"active":""} aria-label={`Go to ${s.label}`} aria-current={zone===s.id?"step":undefined} onClick={()=>choose(s.id)}/>)}</div><button onClick={()=>scene.current?.next()} aria-label="Next section"><ArrowRight size={16}/></button></div><button className="scroll-hint" onClick={()=>scene.current?.next()}>SCROLL TO EXPLORE <ArrowDown size={14}/></button></footer>
  <div className="canvas-hint" aria-hidden="true"><span>DRAG / SCROLL TO MOVE</span><ArrowUpRight size={13}/></div>
  {cartOpen&&<div className="drawer-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setCartOpen(false)}}><aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title"><div className="drawer-head"><div><span className="eyebrow">YOUR LITTLE RITUAL</span><h2 id="cart-title">Your bag <sup>{totalQty}</sup></h2></div><button className="icon-button" onClick={()=>setCartOpen(false)} aria-label="Close bag"><X/></button></div><div className="cart-items">{products.filter(p=>cart[p.id]).map(p=><article className="cart-item" key={p.id}><div className="cart-item-copy"><small>{p.kind}</small><h3>{p.name}</h3><span>${p.price.toFixed(2)} each</span></div><div className="quantity"><button onClick={()=>change(p.id,-1)} aria-label={`Remove one ${p.name}`}><Minus size={13}/></button><span>{cart[p.id]}</span><button onClick={()=>change(p.id,1)} aria-label={`Add one ${p.name}`}><Plus size={13}/></button></div><strong>${(p.price*cart[p.id]).toFixed(2)}</strong><button className="remove-item" onClick={()=>setCart(c=>{const n={...c};delete n[p.id];return n})} aria-label={`Remove ${p.name}`}><X size={14}/></button></article>)}{!totalQty&&<div className="empty-cart"><ShoppingBag size={24}/><p>Your bag is taking a quiet moment.</p><button onClick={()=>{setCartOpen(false);choose("collection")}}>Explore the menu <ArrowRight size={15}/></button></div>}</div>{!!totalQty&&<div className="cart-summary"><div><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div><p>Pickup and taxes are settled at the counter.</p><button className="primary-cta" onClick={()=>setCartOpen(false)}>Continue exploring <ArrowRight size={16}/></button><small>No online checkout or payment processing.</small></div>}</aside></div>}
 </main>
}
