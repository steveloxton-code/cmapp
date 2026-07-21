import { CHANGE_TYPES, STAGES, BAR_C } from "../constants.jsx";
import { TypeBadge, StageBadge } from "./Shared.jsx";

export default function Dashboard({stats,changes,onFilter}){
  const byType  = CHANGE_TYPES.map(t=>({type:t,count:changes.filter(c=>c.type===t).length}));
  const byStage = STAGES.filter(s=>changes.some(c=>c.stage===s)).map(s=>({stage:s,count:changes.filter(c=>c.stage===s).length}));
  const maxType = Math.max(...byType.map(x=>x.count),1);
  const cards = [
    {label:"Total changes",    value:stats.total,      grad:"135deg,#6C63FF,#534AB7",stage:null,type:null},
    {label:"Pending / New",    value:stats.pending,    grad:"135deg,#F4A541,#BA7517",stage:"Pending",type:null},
    {label:"Awaiting CAB",     value:stats.cab,        grad:"135deg,#378ADD,#185FA5",stage:"Awaiting CAB",type:null},
    {label:"In implementation",value:stats.inProgress, grad:"135deg,#E8312A,#991B1B",stage:"Implementation",type:null},
  ];
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:"1.5rem"}}>
        {cards.map(({label,value,grad,stage,type})=>(
          <div key={label} onClick={()=>onFilter(type,stage)} onMouseEnter={e=>e.currentTarget.style.opacity="0.85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}
            style={{background:`linear-gradient(${grad})`,borderRadius:14,padding:"1.1rem 1.25rem",cursor:"pointer",transition:"opacity 0.15s",boxShadow:"0 2px 8px rgba(0,0,0,0.10)"}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.75)",fontWeight:500,marginBottom:6,letterSpacing:"0.03em"}}>{label.toUpperCase()}</div>
            <div style={{fontSize:34,fontWeight:700,color:"white",lineHeight:1}}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,padding:"1.25rem"}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:16}}>Changes by type</div>
          {byType.map(({type,count})=>(
            <div key={type} onClick={()=>onFilter(type,null)} onMouseEnter={e=>e.currentTarget.style.background="var(--color-background-secondary)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
              style={{marginBottom:10,padding:"7px 10px",borderRadius:8,cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <TypeBadge type={type}/><span style={{fontSize:12,fontWeight:500,color:"var(--color-text-secondary)"}}>{count}</span>
              </div>
              <div style={{height:5,background:"var(--color-background-secondary)",borderRadius:3,overflow:"hidden"}}>
                <div style={{width:`${(count/maxType)*100}%`,height:"100%",background:BAR_C[type],borderRadius:3,minWidth:count>0?"6px":"0"}}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,padding:"1.25rem"}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:16}}>Changes by stage</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
            {byStage.map(({stage,count})=>(
              <div key={stage} onClick={()=>onFilter(null,stage)} onMouseEnter={e=>e.currentTarget.style.opacity="0.7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}
                style={{display:"flex",alignItems:"center",gap:5,background:"var(--color-background-secondary)",borderRadius:8,padding:"5px 10px 5px 7px",cursor:"pointer"}}>
                <StageBadge stage={stage}/><span style={{fontSize:11,fontWeight:500,color:"var(--color-text-secondary)"}}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
