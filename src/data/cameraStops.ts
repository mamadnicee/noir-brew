export type Zone = "opening" | "collection" | "lab" | "journal" | "visit";
export const stops: {id:Zone;label:string;position:[number,number,number];target:[number,number,number];fov:number}[] = [
 {id:"opening",label:"Home",position:[5,3.1,8],target:[0,0.8,0],fov:42},
 {id:"collection",label:"Menu",position:[-6,2.4,5],target:[0,0.9,0],fov:39},
 {id:"lab",label:"Our craft",position:[-5,3,-5],target:[0,1,0],fov:41},
 {id:"journal",label:"Journal",position:[5,2.5,-6],target:[0,0.7,0],fov:40},
 {id:"visit",label:"Visit",position:[7,4,3],target:[0,1,0],fov:44},
];
