import {start,move,won,solve,makeLevel} from './engine.mjs';
import {levels as data} from './levels.mjs';
const levels=data.map(l=>makeLevel(l.rows,l.title,l.note));
const $=s=>document.querySelector(s);
let index=0,state=start(levels[0]),history=[],moves=0,hinted=false;
const select=$('#level'); levels.forEach((l,i)=>{const o=document.createElement('option');o.value=i;o.textContent=`${i+1}. ${l.title}`;select.append(o)});
function load(i){index=i;state=start(levels[i]);history=[];moves=0;hinted=false;select.value=i;render();}
function step(d){if(won(levels[index],state))return;const next=move(levels[index],state,d);if(!next){$('#status').textContent='That tile is closed on the arriving tide. Try another route.';return}history.push({...state});state=next;moves++;hinted=false;render();}
function render(){
 const l=levels[index], complete=won(l,state),board=$('#board'); board.replaceChildren();board.style.gridTemplateColumns=`repeat(${l.width},1fr)`;
 $('#chapter').textContent=`ISLAND ${String(index+1).padStart(2,'0')} / ${levels.length}`;$('#note').textContent=l.note;
 $('#phase').textContent=state.phase?'● Blue tide':'● Amber tide';$('#phase').className=state.phase?'blue-phase':'';
 const collected=state.pearls.toString(2).replace(/0/g,'').length;$('#score').textContent=`${collected}/${l.pearls.length} pearls · ${moves} steps`;
 const legal=new Map();for(let d=0;d<4;d++){const n=move(l,state,d);if(n)legal.set(n.at,d)}
 l.rows.forEach((row,y)=>[...row].forEach((c,x)=>{
 const at=y*l.width+x,button=document.createElement('button');const kinds={A:'amber',B:'blue',H:'hold',E:'exit','#':'wall'};
 button.className=`tile ${kinds[c]||''} ${at===state.at?'player':''} ${legal.has(at)&&!complete?'legal':''}`;
 const pearlIndex=l.pearls.indexOf(at),pearl=pearlIndex>=0&&!(state.pearls&(1<<pearlIndex));
 button.setAttribute('aria-label',`Row ${y+1}, column ${x+1}: ${at===state.at?'you, ':''}${pearl?'pearl, ':''}${({A:'amber gate',B:'blue gate',H:'still water',E:'lighthouse','#':'sea'})[c]||'stone'}`);
 button.disabled=c==='#'; if(c==='#')button.tabIndex=-1;
 if(at===state.at){const token=document.createElement('span');token.className='token';token.textContent='◒';button.append(token)}
 else if(pearl){const pearl=document.createElement('span');pearl.className='pearl';button.append(pearl)}
 else button.textContent=c==='H'?'≋':c==='E'?'⚑':'';
 if(c==='A'||c==='B'){const mark=document.createElement('span');mark.className='mark';mark.textContent=c==='A'?'A':'B';button.append(mark)}
 button.addEventListener('click',()=>{if(legal.has(at))step(legal.get(at));else $('#status').textContent='Tap a neighboring tile. Gates must match the tide after your step.'});board.append(button);
 }));
 $('#undo').disabled=!history.length;$('#next').hidden=!complete||index===levels.length-1;
 $('#status').textContent=complete?(index===levels.length-1?'All islands restored. Beautifully navigated! Choose any island to play again.':'Lighthouse reached. The island is glowing again!'):state.at===l.exit?'The lighthouse needs every pearl. You can leave and return.':moves===0?'Collect every pearl, then return to the lighthouse.':'Every step flips the tide. Leaving ≋ keeps it unchanged.';
}
$('#undo').onclick=()=>{if(history.length){state=history.pop();moves--;hinted=false;render()}};
$('#reset').onclick=()=>load(index);$('#next').onclick=()=>load(index+1);select.onchange=()=>load(Number(select.value));
$('#hint').onclick=()=>{const path=solve(levels[index],state);hinted=true;$('#status').textContent=path?.length?`Try ${['up ↑','right →','down ↓','left ←'][path[0]]}. ${path.length} steps remain on a shortest route.`:path?'You have already restored this island.':'No route from here. Undo a step or restart.'};
document.addEventListener('keydown',e=>{if(e.target.tagName==='SELECT'||e.target.tagName==='INPUT')return;const key={ArrowUp:0,w:0,ArrowRight:1,d:1,ArrowDown:2,s:2,ArrowLeft:3,a:3}[e.key];if(key!==undefined){e.preventDefault();step(key)}else if(e.key==='z')$('#undo').click();else if(e.key==='r')load(index)});
render();
