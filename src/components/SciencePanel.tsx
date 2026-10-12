import { useEffect, useRef } from "react";
import { X } from "lucide-react";
export type ScienceFact={id:string;title:string;body:string};
type Props={open:boolean;fact:ScienceFact|null;onClose:()=>void};
export default function SciencePanel({open,fact,onClose}:Props){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(open)ref.current?.focus()},[open]);
 useEffect(()=>{const k=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose()};if(open)document.addEventListener("keydown",k);return()=>document.removeEventListener("keydown",k)},[open,onClose]);
 if(!open||!fact)return null;
 return(<div className="panel-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
  <div ref={ref} className="science-panel" role="dialog" aria-modal="true" aria-labelledby="science-panel-title" tabIndex={-1}>
   <div className="panel-head"><span className="eyebrow">STATION SCIENCE</span><h2 id="science-panel-title">{fact.title}</h2>
   <button type="button" className="icon-button" onClick={onClose} aria-label="Close science panel"><X size={18}/></button></div>
   <p>{fact.body}</p>
   <div className="panel-foot"><button type="button" className="primary-cta" onClick={onClose}>بازگشت · Back to orbit</button></div>
  </div></div>);
}
