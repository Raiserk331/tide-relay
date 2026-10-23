// Original implementation for the Experiment project, 2026.
export const directions = [[0,-1],[1,0],[0,1],[-1,0]];
export function start(level) { return { at: level.start, phase: 0, pearls: 0 }; }
export function move(level, state, direction) {
  const [dx,dy] = directions[direction] || [];
  if (dx === undefined) return null;
  const x=state.at%level.width+dx, y=Math.floor(state.at/level.width)+dy;
  if(x<0 || y<0 || x>=level.width || y>=level.rows.length) return null;
  const at=y*level.width+x, tile=level.rows[y][x];
  if(tile==='#') return null;
  const phase=level.rows[Math.floor(state.at/level.width)][state.at%level.width]==='H' ? state.phase : 1-state.phase;
  if(tile==='A' && phase!==0 || tile==='B' && phase!==1) return null;
  const index=level.pearls.indexOf(at);
  return { at, phase, pearls:index<0 ? state.pearls : state.pearls | (1<<index) };
}
export function won(level,state) {return state.at===level.exit && state.pearls===(1<<level.pearls.length)-1;}
export function solve(level, initial=start(level)) {
  const key=s=>`${s.at}:${s.phase}:${s.pearls}`;
  const queue=[{state:initial,path:[]}], seen=new Set([key(initial)]);
  for(let i=0;i<queue.length;i++) {
    const {state,path}=queue[i];
    if(won(level,state)) return path;
    for(let d=0;d<4;d++) {const next=move(level,state,d);if(next&&!seen.has(key(next))) {seen.add(key(next));queue.push({state:next,path:[...path,d]});}}
  }
  return null;
}
export function makeLevel(rows, title, note) {
  const width=rows[0].length, flat=rows.join('');
  return {rows,width,title,note,start:flat.indexOf('S'),exit:flat.indexOf('E'),pearls:[...flat].flatMap((c,i)=>c==='o'?[i]:[])};
}
