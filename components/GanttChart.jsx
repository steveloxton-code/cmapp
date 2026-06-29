import { useState } from "react";
import { CHANGE_TYPES, BAR_C, fmtDate, clashCheck } from "../constants.jsx";
import { TypeBadge, StageBadge, RiskBadge, Badge } from "./Shared.jsx";

export default function GanttChart({changes,onSelect}){
  const [zoom,setZoom]           = useState("week");
  const [offsetDays,setOffsetDays] = useState(0);
  const [tooltip,setTooltip]     = useState(null);

  const fscChanges = changes.filter(c=>c.plannedStart&&c.plannedEnd&&!["Rejected","Completed"].includes(c.stage));
  const DAYS    = zoom==="week"?7:zoom==="fortnight"?14:28;
  const today   = new Date(); today.setHours(0,0,0,0);
  const vStart  = new Date(today); vStart.setDate(vStart.getDate()+offsetDays);
  const vEnd    = new Date(vStart); vEnd.setDate(vEnd.getDate()+DAYS);
  const dayMs   = 86400000, spanMs=DAYS*dayMs;
  const visible = fscChanges.filter(item=>new Date(item.plannedStart)<vEnd&&new Date(item.plannedEnd)>vStart);
  const lanes   = visible.map((item,i)=>({...item,lane:i}));
  const totalH  = Math.max(lanes.length*44+2,120);
  const nowPct  = Math.max(0,Math.min(100,((new Date()-vStart)/spanMs)*100));
  const showNow = nowPct>0&&nowPct<100;
  const days    = Array.from({length:DAYS},(_,i)=>{const d=new Date(vStart);d.setDate(d.getDate()+i);return d;});

  function pct(d){return Math.max(0,Math.min(100,((new Date(d)-vStart)/spanMs)*100));}
  function bLeft(item){return pct(item.plannedStart);}
  function bWidth(item){const s=Math.max(new Date(item.plannedStart),vStart),e=Math.min(new Date(item.plannedEnd),vEnd);return Math.max(0.3,((e-s)/spanMs)*100);}
  function dayInfo(d){return{isToday:d.toDateString()===new Date().toDateString(),isWeekend:d.getDay()===0||d.getDay()===6};}

  const LW = 190;
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem"}}>
        <p style={{fontSize:13,color:"var(--color-text-secondary)",margin:0}}>{vStart.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})} — {new Date(vEnd-dayMs).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})} · {visible.length} change{visible.length!==1?"s":""}</p>
        <div style={{display:"flex",gap:8}}>
          <div style={{display:"flex",gap:3}}>
            {["week","fortnight","month"].map(z=>(
              <button key={z} onClick={()=>{setZoom(z);setOffsetDays(0);}} style={{fontSize:12,padding:"5px 12px",cursor:"pointer",borderRadius:8,border:"0.5px solid var(--color-border-tertiary)",background:zoom===z?"#534AB7":"var(--color-background-primary)",color:zoom===z?"white":"var(--color-text-secondary)",fontWeight:zoom===z?500:400}}>{z==="fortnight"?"2 wks":z}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:2}}>
            <button onClick={()=>setOffsetDays(p=>p-DAYS)} style={{fontSize:13,padding:"5px 10px",cursor:"pointer",borderRadius:8,border:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-primary)",color:"var(--color-text-secondary)"}}>‹</button>
            <button onClick={()=>setOffsetDays(0)} style={{fontSize:12,padding:"5px 10px",cursor:"pointer",borderRadius:8,border:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-primary)",color:"var(--color-text-secondary)"}}>Today</button>
            <button onClick={()=>setOffsetDays(p=>p+DAYS)} style={{fontSize:13,padding:"5px 10px",cursor:"pointer",borderRadius:8,border:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-primary)",color:"var(--color-text-secondary)"}}>›</button>
          </div>
        </div>
      </div>
      <div style={{display:"flex",gap:16,marginBottom:"0.75rem",flexWrap:"wrap"}}>
        {CHANGE_TYPES.map(t=><div key={t} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"var(--color-text-secondary)"}}><span style={{width:20,height:8,borderRadius:2,background:BAR_C[t],display:"inline-block"}}/>{t}</div>)}
        <div style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"var(--color-text-secondary)"}}><span style={{width:2,height:12,background:"#E24B4A",display:"inline-block",borderRadius:1}}/>Today</div>
      </div>
      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,overflow:"visible"}}>
        <div style={{display:"flex"}}>
          <div style={{width:LW,flexShrink:0,borderRight:"0.5px solid var(--color-border-tertiary)"}}>
            <div style={{height:36,borderBottom:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-secondary)",display:"flex",alignItems:"center",padding:"0 12px"}}>
              <span style={{fontSize:11,fontWeight:600,color:"var(--color-text-secondary)",letterSpacing:"0.05em"}}>CHANGE</span>
            </div>
            {lanes.length===0&&<div style={{height:120}}/>}
            {lanes.map(item=>(
              <div key={item.id} onClick={()=>onSelect(item)} onMouseEnter={e=>e.currentTarget.style.background="var(--color-background-secondary)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                style={{height:44,borderBottom:"0.5px solid var(--color-border-tertiary)",display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 10px 0 12px",cursor:"pointer",boxSizing:"border-box"}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}>
                  <span style={{fontSize:11,fontWeight:600,color:"#534AB7",flexShrink:0}}>{item.id}</span>
                  <span style={{width:6,height:6,borderRadius:2,background:BAR_C[item.type],flexShrink:0,display:"inline-block"}}/>
                </div>
                <span style={{fontSize:11,color:"var(--color-text-secondary)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:LW-22,lineHeight:1.3}}>{item.title}</span>
              </div>
            ))}
          </div>
          <div style={{flex:1,overflow:"hidden",position:"relative"}}>
            <div style={{display:"flex",height:36,borderBottom:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-secondary)"}}>
              {days.map((d,i)=>{const{isToday,isWeekend}=dayInfo(d);return(
                <div key={i} style={{flex:1,borderRight:i<days.length-1?"0.5px solid var(--color-border-tertiary)":"none",display:"flex",alignItems:"center",justifyContent:"center",background:isToday?"#EEEDFE":isWeekend?"var(--color-background-tertiary)":"transparent",padding:"0 2px",minWidth:0}}>
                  <span style={{fontSize:zoom==="month"?9:10,fontWeight:isToday?600:400,color:isToday?"#534AB7":isWeekend?"var(--color-text-tertiary)":"var(--color-text-secondary)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",textAlign:"center"}}>{zoom==="month"?d.getDate():d.toLocaleDateString("en-GB",{weekday:"short",day:"2-digit",month:"short"})}</span>
                </div>
              );})}
            </div>
            <div style={{position:"relative",height:totalH}}>
              {days.map((d,i)=>{const{isToday,isWeekend}=dayInfo(d);return<div key={i} style={{position:"absolute",top:0,bottom:0,left:`${(i/DAYS)*100}%`,width:`${(1/DAYS)*100}%`,background:isToday?"rgba(83,74,183,0.04)":isWeekend?"var(--color-background-secondary)":"transparent",borderRight:"0.5px solid var(--color-border-tertiary)",boxSizing:"border-box"}}/>;} )}
              {showNow&&<div style={{position:"absolute",top:0,bottom:0,left:`${nowPct}%`,width:1.5,background:"#E24B4A",zIndex:10,pointerEvents:"none"}}/>}
              {lanes.length===0&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:120,fontSize:13,color:"var(--color-text-secondary)"}}>No changes in this window</div>}
              {lanes.map(item=>{
                const left=bLeft(item), width=bWidth(item), clashes=clashCheck(item,lanes);
                return (
                  <div key={item.id} style={{position:"absolute",top:item.lane*44+7,height:30,left:`${left}%`,width:`${width}%`,minWidth:4,boxSizing:"border-box",zIndex:5}}>
                    <div onClick={()=>onSelect(item)}
                      onMouseEnter={e=>setTooltip({id:item.id,title:item.title,type:item.type,risk:item.risk,stage:item.stage,service:item.service,start:item.plannedStart,end:item.plannedEnd,clashes:clashes.length,x:e.clientX,y:e.clientY})}
                      onMouseLeave={()=>setTooltip(null)}
                      style={{width:"100%",height:"100%",background:BAR_C[item.type],borderRadius:6,cursor:"pointer",display:"flex",alignItems:"center",paddingLeft:7,boxSizing:"border-box",border:clashes.length>0?"1.5px solid #BA7517":"1.5px solid transparent",boxShadow:"0 1px 3px rgba(0,0,0,0.15)",position:"relative"}}>
                      <span style={{fontSize:10,fontWeight:600,color:"white",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",lineHeight:1}}>{width>8?item.id:""}</span>
                      {clashes.length>0&&width>12&&<span style={{position:"absolute",right:4,top:"50%",transform:"translateY(-50%)",width:6,height:6,borderRadius:3,background:"#EF9F27",border:"1px solid white"}}/>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {tooltip&&(
        <div style={{position:"fixed",left:Math.min(tooltip.x+14,window.innerWidth-284),top:tooltip.y+14,zIndex:99999,background:"var(--color-background-primary)",border:"1.5px solid var(--color-border-secondary)",borderRadius:12,padding:"12px 16px",width:268,pointerEvents:"none",boxSizing:"border-box",boxShadow:"0 8px 32px rgba(0,0,0,0.22)"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><span style={{fontSize:11,fontWeight:600,color:"#534AB7"}}>{tooltip.id}</span><TypeBadge type={tooltip.type}/></div>
          <div style={{fontSize:13,fontWeight:600,marginBottom:6,lineHeight:1.4,color:"var(--color-text-primary)"}}>{tooltip.title}</div>
          <div style={{fontSize:11,color:"var(--color-text-secondary)",marginBottom:3}}>{tooltip.service}</div>
          <div style={{fontSize:11,color:"var(--color-text-secondary)",marginBottom:8}}>{fmtDate(tooltip.start)} → {fmtDate(tooltip.end)}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}><StageBadge stage={tooltip.stage}/><RiskBadge risk={tooltip.risk}/>{tooltip.clashes>0&&<Badge label={`${tooltip.clashes} clash${tooltip.clashes>1?"es":""}`} bg="#FAEEDA" color="#633806"/>}</div>
        </div>
      )}
    </div>
  );
}
