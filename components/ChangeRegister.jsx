import { CHANGE_TYPES, STAGES, fmtShort } from "../constants.jsx";
import { TypeBadge, RiskBadge, StageBadge } from "./Shared.jsx";
import SubmitChange from "./SubmitChange.jsx";

export default function ChangeRegister({changes,filterType,setFilterType,filterStage,setFilterStage,onSelect,showForm,setShowForm,form,setForm,onSubmit,templates}){
  const filtered = changes.filter(c=>{
    if(filterType!=="All"&&c.type!==filterType)return false;
    if(filterStage==="Pending")return c.stage==="New"||c.stage==="Awaiting CAB";
    if(filterStage!=="All"&&c.stage!==filterStage)return false;
    return true;
  });
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem"}}>
        <p style={{fontSize:13,color:"var(--color-text-secondary)",margin:0}}>{filtered.length} change{filtered.length!==1?"s":""}</p>
        <div style={{display:"flex",gap:8}}>
          <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{fontSize:12,padding:"5px 10px",borderRadius:8,border:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-primary)",color:"var(--color-text-primary)"}}>
            <option value="All">All</option>{CHANGE_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterStage} onChange={e=>setFilterStage(e.target.value)} style={{fontSize:12,padding:"5px 10px",borderRadius:8,border:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-primary)",color:"var(--color-text-primary)"}}>
            <option value="All">All</option>
            <option value="Pending">Pending / New</option>
            {STAGES.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      {showForm&&<SubmitChange form={form} setForm={setForm} onSubmit={onSubmit} onCancel={()=>setShowForm(false)} templates={templates}/>}
      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",tableLayout:"fixed"}}>
          <colgroup><col style={{width:80}}/><col style={{width:88}}/><col/><col style={{width:138}}/><col style={{width:88}}/><col style={{width:72}}/><col style={{width:120}}/></colgroup>
          <thead>
            <tr style={{borderBottom:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-secondary)"}}>
              {["ID","Type","Title","Service","Start","Risk","Stage"].map(h=>(
                <th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:11,fontWeight:600,color:"var(--color-text-secondary)",letterSpacing:"0.05em"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length===0&&<tr><td colSpan={7} style={{padding:"3rem",textAlign:"center",color:"var(--color-text-secondary)",fontSize:13}}>No changes found</td></tr>}
            {filtered.map((item,i)=>(
              <tr key={item.id} onClick={()=>onSelect(item)} onMouseEnter={e=>e.currentTarget.style.background="var(--color-background-secondary)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                style={{borderBottom:i<filtered.length-1?"0.5px solid var(--color-border-tertiary)":"none",cursor:"pointer"}}>
                <td style={{padding:"11px 12px",fontWeight:600,color:"#534AB7",fontSize:12}}>{item.id}</td>
                <td style={{padding:"11px 12px"}}><TypeBadge type={item.type}/></td>
                <td style={{padding:"11px 12px",fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</td>
                <td style={{padding:"11px 12px",fontSize:12,color:"var(--color-text-secondary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.service||"—"}</td>
                <td style={{padding:"11px 12px",fontSize:12,color:"var(--color-text-secondary)",whiteSpace:"nowrap"}}>{fmtShort(item.plannedStart)}</td>
                <td style={{padding:"11px 12px"}}><RiskBadge risk={item.risk}/></td>
                <td style={{padding:"11px 12px"}}><StageBadge stage={item.stage}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
