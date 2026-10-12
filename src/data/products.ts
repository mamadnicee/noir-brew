export type Product = { id: string; name: string; kind: string; price: number; note: string; tag?: string };
export const products: Product[] = [
 {id:"01",name:"Velvet Espresso",kind:"Espresso",price:4.5,note:"Dark chocolate · orange peel",tag:"HOUSE FAVORITE"},
 {id:"02",name:"Black Sesame Latte",kind:"Milk coffee",price:6,note:"Toasted sesame · oat milk"},
 {id:"03",name:"Midnight Mocha",kind:"Milk coffee",price:6.5,note:"Single origin cacao · sea salt",tag:"SIGNATURE"},
 {id:"04",name:"Slow Bloom",kind:"Filter",price:5.5,note:"Ethiopia · jasmine · stone fruit"},
 {id:"05",name:"Cold Brew No. 9",kind:"Cold",price:5,note:"18-hour steep · silky finish"},
 {id:"06",name:"Cardamom Tonic",kind:"Cold",price:5.5,note:"Espresso · citrus · green cardamom"},
];
