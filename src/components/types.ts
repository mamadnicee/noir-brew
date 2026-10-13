export type Station = 'HOME'|'ORIGIN'|'ROAST LAB'|'BREW BAR'|'MENU'|'JOURNAL';
export type Product = {id:string;name:string;origin:string;notes:string;price:number;tag:string;color:string;description:string};
export const stations: Station[]=['HOME','ORIGIN','ROAST LAB','BREW BAR','MENU','JOURNAL'];
export const products: Product[]=[
{id:'house',name:'After Hours',origin:'Huila, Colombia',notes:'Dark chocolate · orange · panela',price:22,tag:'HOUSE BLEND',color:'#9b6749',description:'A velvet-smooth, late-night blend with a long cocoa finish. Sweet, grounded, quietly complex.'},
{id:'single',name:'Cloudline',origin:'Sidama, Ethiopia',notes:'Jasmine · bergamot · stone fruit',price:26,tag:'SINGLE ORIGIN',color:'#c38c62',description:'High-altitude lots, washed and slow-dried. A vivid cup with floral lift and a soft citrus edge.'},
{id:'decaf',name:'Soft Focus',origin:'Tolima, Colombia',notes:'Toffee · almond · fig',price:24,tag:'WATER DECAF',color:'#755041',description:'All the ritual, none of the rush. Sugarcane-decaffeinated and roasted for a rounded, gentle cup.'}
];