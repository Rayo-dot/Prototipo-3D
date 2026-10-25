import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const viewport=document.querySelector('#viewport');
let renderer;
try {
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
} catch(error) {
  document.querySelector('#loading').hidden=true;
  document.querySelector('#webgl-error').hidden=false;
  throw error;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.setClearColor(0x000000,0);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.28;
viewport.append(renderer.domElement);
renderer.domElement.tabIndex=0;
renderer.domElement.setAttribute('aria-label','Modelo tridimensional: arrastra para girar; usa la rueda para acercar. Tambien puedes usar las flechas del teclado.');
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(34,1,1,3000);
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.dampingFactor=.08;
controls.minDistance=270;
controls.maxDistance=1100;
controls.maxPolarAngle=Math.PI*.85;
controls.target.set(0,-58,0);
controls.listenToKeyEvents(renderer.domElement);
const homePosition=new THREE.Vector3(345,175,570);
camera.position.copy(homePosition);
controls.update();
scene.add(new THREE.HemisphereLight(0xffffff,0x8b9a87,2.8));
const key=new THREE.DirectionalLight(0xffffff,3.2); key.position.set(-250,500,450);key.castShadow=true;
key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-400;key.shadow.camera.right=400;key.shadow.camera.top=400;key.shadow.camera.bottom=-400;key.shadow.camera.far=1500;key.shadow.normalBias=.6;
scene.add(key);scene.add(key.target);
const rim=new THREE.DirectionalLight(0xcfe7e3,1.5);rim.position.set(300,50,-250);scene.add(rim);
const mat=(color,options={})=>new THREE.MeshStandardMaterial({color,roughness:.55,metalness:.08,...options});
const bodyMat=mat('#b1c3cb'),lidMat=mat('#98b2bd'),steelMat=mat('#a2b5b8',{metalness:.65,roughness:.32});
const darkMat=mat('#3d535b'),greenMat=mat('#247e66'),filterMat=mat('#f3efe0'),trayMat=mat('#7d9291');
const glassMat=mat('#b7e2df',{transparent:true,opacity:.3,roughness:.15,metalness:0,depthWrite:false});
const partGroups={};const pickables=[];
function group(name,parent=scene){const g=new THREE.Group();g.userData.component=name;parent.add(g);return g;}
function mesh(geometry,material,parent,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);pickables.push(m);return m;}
function box(w,h,d,parent,x,y,z,material=bodyMat){return mesh(new THREE.BoxGeometry(w,h,d),material,parent,x,y,z);}
function cylinder(r,h,parent,x,y,z,material=steelMat,axis='y',segments=48){const m=mesh(new THREE.CylinderGeometry(r,r,h,segments),material,parent,x,y,z);if(axis==='x')m.rotation.z=Math.PI/2;if(axis==='z')m.rotation.x=Math.PI/2;return m;}
function rounded(w,h,r,Path=THREE.Shape){const s=new Path();const x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
function rectHole(shape,x,y,w,h){const p=new THREE.Path();p.moveTo(x,y);p.lineTo(x,y+h);p.lineTo(x+w,y+h);p.lineTo(x+w,y);p.closePath();shape.holes.push(p);}
function roundHole(shape,x,y,r){const p=new THREE.Path();p.absarc(x,y,r,0,Math.PI*2,true);shape.holes.push(p);}
function extrude(shape,depth,parent,material,x=0,y=0,z=0){return mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:12}),material,parent,x,y,z);}
function label(text,width,height,parent,x,y,z,color='#122f35',fontSize=64){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,1024,256);ctx.fillStyle=color;ctx.font=`600 ${fontSize*2}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,128,1000);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide});const m=mesh(new THREE.PlaneGeometry(width,height),material,parent,x,y,z);m.castShadow=false;return m;}

// Geometria de presentacion basada en el SCAD. Carcasa 250 x 150 x 120 mm.
// Coordenadas de escena: X horizontal, Y altura, Z hacia el observador.
const shell=group('carcasa');partGroups.carcasa=shell;
const shellShape=rounded(250,150,8);shellShape.holes.push(rounded(244,144,5,THREE.Path));
extrude(shellShape,120,shell,bodyMat,0,0,-60);
extrude(rounded(244,144,5),3,shell,bodyMat,0,0,-60);
box(244,3,114,shell,0,-8.5,0);
for(const x of [-134,134]){
  const ear=new THREE.Shape();ear.moveTo(-10,-13);ear.lineTo(10,-13);ear.lineTo(10,13);ear.lineTo(-10,13);ear.closePath();roundHole(ear,0,0,2.5);extrude(ear,8,shell,bodyMat,x,38,-60);
}
for(const x of [-113,113])for(const y of [-25,63]){const shape=new THREE.Shape();shape.absarc(0,0,6,0,Math.PI*2);roundHole(shape,0,0,1.7);extrude(shape,12,shell,bodyMat,x,y,48);}

// Tapa, ventana provisional 60 x 30, marco 96 x 66.
const lid=group('monitor');partGroups.monitor=lid;
const lidShape=rounded(250,150,8);
const monitorX=35+60/2-125,monitorY=85+30/2-75;
rectHole(lidShape,monitorX-30,monitorY-15,60,30);
for(const x of [10,40,70])roundHole(lidShape,x,37,2.5);
roundHole(lidShape,95,25,4);
for(const x of [-113,113])for(const y of [-25,63])roundHole(lidShape,x,y,1.7);
extrude(lidShape,3,lid,lidMat,0,0,60);
const surround=rounded(96,66,1);rectHole(surround,-30,-15,60,30);extrude(surround,1,lid,lidMat,monitorX,monitorY,63);
// Placeholder comercial: la abertura definitiva queda pendiente.
box(59,29,1,lid,monitorX,monitorY,61.5,mat('#203f46',{roughness:.25}));
label('MONITOR',49,8,lid,monitorX,monitorY+3,62.1,'#c5ddd7',56);
label('MODELO POR DEFINIR',52,6,lid,monitorX,monitorY-5,62.1,'#8eada9',44);
const ledNames=['Encendido','Alerta','Falla'];
const ledColors=['#58b797','#ddaf54','#c77969'];
for(let i=0;i<3;i++){cylinder(2.2,2,lid,10+i*30,37,63.1,mat(ledColors[i],{emissive:ledColors[i],emissiveIntensity:.12}), 'z');label(ledNames[i],30,8,lid,10+i*30,48,64);}
cylinder(3.7,2,lid,95,25,64,darkMat,'z');
label('Salida',31,9,lid,-95,-46,64);
label('Entrada',31,9,lid,95,-46,64);
for(const x of [-101,89]){box(12,1.6,.5,lid,x,-53,64,mat('#15353b'));const tri=new THREE.Shape();tri.moveTo(0,0);tri.lineTo(5,3);tri.lineTo(5,-3);tri.closePath();extrude(tri,.5,lid,darkMat,x-11,-53,64);}
label('F1',20,12,lid,-11,-65,64);label('F2',20,12,lid,73,-65,64);
for(const x of [-113,113])for(const y of [-25,63]){cylinder(2.5,1,lid,x,y,63.4,steelMat,'z');box(2,.45,.2,lid,x,y,64,darkMat);}

// F1 izquierda (X=114) y F2 derecha (X=198). Vasos a escala.
const filters=group('filtros');partGroups.filtros=filters;
const movingCups=[];
for(const x of [-11,73]){
  cylinder(39,28,filters,x,-53,0,darkMat);
  cylinder(41.4,5,filters,x,-69.5,0,bodyMat);
  const cup=group('filtros',filters);movingCups.push(cup);
  const wallShape=new THREE.Shape();wallShape.absarc(0,0,35,0,2*Math.PI);roundHole(wallShape,0,0,32);
  const cupWall=extrude(wallShape,136,cup,glassMat,x,-199,0);cupWall.rotation.x=-Math.PI/2;
  cylinder(35,3,cup,x,-197.5,0,glassMat);
  cylinder(21,110,cup,x,-141,0,filterMat);
  // Detalle de cartucho puramente visual, no roscas ni sellos.
  for(let j=0;j<12;j++){const a=j/12*Math.PI*2;const stripe=box(1.1,104,1.1,cup,x+20*Math.cos(a),-141,20*Math.sin(a),mat('#dfd9c5'));stripe.rotation.y=-a;}
}

// Sensor simplificado 60 x 35 x 35 mm, a la izquierda.
const sensor=group('sensor');partGroups.sensor=sensor;
box(60,35,35,sensor,-85,-53,0,mat('#d59956'));
cylinder(10,4,sensor,-85,-33.5,0,darkMat);
label('CAUDAL',29,8,sensor,-85,-51,18,'#573d24',52);
box(60,1.5,35,shell,-85,-71.25,0,trayMat);

// Conexiones nominales: diametro exterior visual de 25 mm.
const pipes=group('carcasa');
function pipe(a,b){const shape=new THREE.Shape();shape.absarc(0,0,12.5,0,Math.PI*2);roundHole(shape,0,0,7.5);const p=extrude(shape,b-a,pipes,steelMat,a,-53,0);p.rotation.y=Math.PI/2;}
pipe(-145,-113);pipe(-57,-48);pipe(26,36);pipe(110,145);

// Bandeja y placa, aisladas del circuito por la division.
const board=group('electronica');partGroups.electronica=board;
box(70,3,40,board,55,-5.5,-32,trayMat);
for(const x of [21.5,88.5])box(3,5,40,board,x,-1.5,-32,trayMat);
box(60,15,30,board,55,3.5,-32,greenMat);
box(18,3,15,board,51,12.5,-32,darkMat);
for(const x of [32,78])for(const z of [-42,-22])cylinder(1.5,1,board,x,11.5,z,steelMat);

// Prensaestopas de alimentacion, lateral superior izquierdo.
const gland=group('electronica');
cylinder(9,18,gland,-140,30,-30,darkMat,'x');
cylinder(11,6,gland,-128,30,-30,darkMat,'x',6);
cylinder(5.6,8,gland,-122,30,-30,darkMat,'x');
cylinder(11,4,gland,-120,30,-30,darkMat,'x',6);
cylinder(3,15,gland,-156,30,-30,mat('#263a3b'),'x');

// Suelo: solo referencia visual, no forma parte del producto.
const floor=new THREE.Mesh(new THREE.PlaneGeometry(2000,2000),new THREE.ShadowMaterial({opacity:.13}));floor.rotation.x=-Math.PI/2;floor.position.y=-210;floor.receiveShadow=true;scene.add(floor);
const grid=new THREE.GridHelper(600,24,0xc5d3c0,0xd7e0d1);grid.position.y=-209.8;grid.material.transparent=true;grid.material.opacity=.35;scene.add(grid);

// Particulas ilustrativas. No son una simulacion hidraulica ni datos reales.
const flowGroup=new THREE.Group();scene.add(flowGroup);flowGroup.visible=false;
const flowDots=[];
const flowMaterial=new THREE.MeshBasicMaterial({color:'#14aeb6',transparent:true,opacity:.9,depthTest:false});
for(let i=0;i<16;i++){const dot=new THREE.Mesh(new THREE.SphereGeometry(1.9,12,8),flowMaterial);dot.renderOrder=20;flowGroup.add(dot);flowDots.push(dot);}

const details={
 carcasa:['01 · CARCASA','Protección y acceso al mantenimiento','Carcasa de 250 × 150 × 120 mm, paredes de 3 mm y tapa desmontable con cuatro fijaciones M3. Dos orejas permiten el montaje en pared.'],
 monitor:['02 · INTERFAZ','Monitor e indicadores del equipo','Abertura provisional de 60 × 30 mm con marco de 96 × 66 mm. El monitor comercial está pendiente de elección. Los testigos indican Encendido, Alerta y Falla.'],
 filtros:['03 · FILTRACIÓN','Dos filtros conectados en serie','F2 está a la derecha y recibe el agua primero; F1 está a la izquierda. Vasos de 70 mm de diámetro y conjuntos de 160 mm de altura. Cartuchos representativos, sin especificar todavía su función de filtración.'],
 sensor:['04 · MEDICIÓN','Sensor de caudal después de los filtros','Representación comercial de 60 × 35 × 35 mm. Se ubica a la izquierda, después de F1 y antes de la salida. Tamaño y conexiones pendientes del sensor elegido.'],
 electronica:['05 · CONTROL','Electrónica separada del recorrido del agua','Placa referencial de 60 × 30 × 15 mm sobre una bandeja superior. Una división separa los compartimientos. El prensaestopas lateral representa la entrada de alimentación de baja tensión. No se ha validado estanqueidad.']
};
let selected=null,currentView='assembled',flowEnabled=false;
let pointerStart={x:0,y:0},lastTime=0,elapsed=0;
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),4000);}
function selectComponent(id){selected=id;document.querySelectorAll('[data-component]').forEach(b=>b.classList.toggle('active',b.dataset.component===id));const d=details[id];document.querySelector('#detail-tag').textContent=d[0];document.querySelector('#detail-title').textContent=d[1];document.querySelector('#detail-text').textContent=d[2];if(['sensor','electronica','filtros'].includes(id)&&currentView==='assembled')setView('internal');}
function setView(view){currentView=view;document.querySelectorAll('[data-view]').forEach(b=>{const active=b.dataset.view===view;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});document.querySelector('#view-title').textContent={assembled:'Equipo ensamblado',internal:'Distribución interior',exploded:'Despiece del equipo'}[view];document.querySelector('.intro>.eyebrow span').textContent={assembled:'01 / 03',internal:'02 / 03',exploded:'03 / 03'}[view];lid.visible=view!=='internal';if(view==='exploded')controls.minDistance=350;else controls.minDistance=270;resize();}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
document.querySelectorAll('[data-component]').forEach(b=>b.addEventListener('click',()=>selectComponent(b.dataset.component)));
document.querySelector('#flow').addEventListener('click',()=>{flowEnabled=!flowEnabled;flowGroup.visible=flowEnabled;const b=document.querySelector('#flow');b.classList.toggle('active',flowEnabled);b.setAttribute('aria-pressed',String(flowEnabled));b.innerHTML=flowEnabled?'<span>Ⅱ</span> Ocultar recorrido':'<span>▷</span> Mostrar recorrido';if(flowEnabled)toast('Recorrido ilustrativo: Entrada → F2 → F1 → sensor → Salida');});
function resetCamera(front=false){controls.target.set(0,currentView==='exploded'?-75:-58,0);camera.position.copy(front?new THREE.Vector3(0,-58,720):homePosition);controls.update();}
document.querySelector('#reset').addEventListener('click',()=>resetCamera());
document.querySelector('#front').addEventListener('click',()=>resetCamera(true));
document.querySelector('#present').addEventListener('click',async()=>{const presentation=document.body.classList.toggle('presentation');document.querySelector('#present span').textContent=presentation?'Salir de presentación':'Pantalla completa';try{if(presentation&&!document.fullscreenElement)await document.documentElement.requestFullscreen();else if(!presentation&&document.fullscreenElement)await document.exitFullscreen();}catch{toast('Modo presentación activo. Puedes usar F11 para ampliar el navegador.');}resize();});
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&document.body.classList.contains('presentation')){document.body.classList.remove('presentation');document.querySelector('#present span').textContent='Pantalla completa';resize();}});
document.querySelector('#capture').addEventListener('click',()=>{try{renderer.render(scene,camera);const link=document.createElement('a');link.download=`medidor-${currentView}.png`;link.href=renderer.domElement.toDataURL('image/png');link.click();toast('Imagen del modelo guardada en PNG.');}catch{toast('No se pudo guardar la imagen. Puedes capturar la pantalla.');}});
const raycaster=new THREE.Raycaster();
renderer.domElement.addEventListener('pointerdown',e=>{pointerStart={x:e.clientX,y:e.clientY};});
renderer.domElement.addEventListener('pointerup',e=>{if(Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>5)return;const rect=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const hits=raycaster.intersectObjects(pickables).filter(hit=>{let o=hit.object;while(o){if(!o.visible)return false;o=o.parent;}return true;});if(hits.length){let o=hits[0].object;while(o&&!o.userData.component)o=o.parent;if(o&&details[o.userData.component])selectComponent(o.userData.component);}});
function resize(){const width=viewport.clientWidth,height=viewport.clientHeight;if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.zoom=Math.min(1,camera.aspect/1.1)*(currentView==='exploded'?.85:1);camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(viewport);resize();
function animate(time){const dt=Math.min((time-lastTime)/1000,.05)||.016;lastTime=time;elapsed+=dt;const factor=reducedMotion?1:1-Math.exp(-dt*8);const exploded=currentView==='exploded';lid.position.z=THREE.MathUtils.lerp(lid.position.z,exploded?100:0,factor);movingCups.forEach(c=>c.position.y=THREE.MathUtils.lerp(c.position.y,exploded?-65:0,factor));board.position.y=THREE.MathUtils.lerp(board.position.y,exploded?40:0,factor);floor.position.y=exploded?-275:-210;grid.position.y=floor.position.y+.2;for(let i=0;i<flowDots.length;i++){const progress=(i/flowDots.length+(reducedMotion?0:elapsed*.12))%1;flowDots[i].position.set(145-progress*290,-53,14);}controls.update();renderer.render(scene,camera);requestAnimationFrame(animate);}
document.querySelector('#loading').remove();
requestAnimationFrame(animate);
// Punto de inspeccion solo para las pruebas del visor.
window.__medidor={get view(){return currentView;},get selected(){return selected;},get flow(){return flowEnabled;},get rendererReady(){return !!renderer;}};
