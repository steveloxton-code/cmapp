import { useState } from "react";
import { TASK_STATUSES, fmtShort } from "../constants.jsx";
import { TaskStatusBadge, PriBadge, Badge, TypeBadge } from "./Shared.jsx";

export default function MyTasks({tasks,changes,onUpdateTask,onSelectChange}){
  const [statusFilter,setStatusFilter] = useState("All");
  const filtered = tasks.filter(t=>statusFilter==="All"||t.status===statusFilter);
  return (
    <div>
      <p style={{fontSize:13,color:"var(--color-text-secondary)",margin:"0 0 1.25rem"}}>Change tasks assigned to you across all changes.</p>
      <div style={{display:"flex",gap:12,marginBottom:"1.25rem"}}>
        {[["Open","#E8312A"],["In Progress","#854F0B"],["Completed","#085041"]].map(([label,color])=>(
          <div key={label} style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,padding:"10px 16px",flex:1}}>
            <div style={{fontSize:11,color:"var(--color-text-secondary)",marginBottom:4}}>{label}</div>
            <div style={{fontSize:24,fontWeight:600,color}}>{tasks.filter(t=>t.status===label).length}</div>
          </div>
        ))}
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,padding:"10px 16px",flex:1}}>
          <div style={{fontSize:11,color:"var(--color-text-secondary)",marginBottom:4}}>Total</div>
          <div style={{fontSize:24,fontWeight:600,color:"#534AB7"}}>{tasks.length}</div>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"1rem"}}>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{fontSize:12,padding:"5px 10px",borderRadius:8,border:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-primary)",color:"var(--color-text-primary)"}}>
          <option>All</option>{TASK_STATUSES.map(s=><option key={s}>{s}</option>)}
        </select>
      </div>
      {filtered.length===0&&<div style={{textAlign:"center",padding:"3rem 0",color:"var(--color-text-secondary)",fontSize:13}}>No tasks found.</div>}
      <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
        {filtered.map(task=>{
          const change  = changes.find(c=>c.id===task.changeId);
          const overdue = task.dueDate&&new Date(task.dueDate)<new Date()&&!["Completed","Cancelled"].includes(task.status);
          return (
            <div key={task.id} style={{background:"var(--color-background-primary)",border:`0.5px solid ${overdue?"#EF9F27":"var(--color-border-tertiary)"}`,borderRadius:14,padding:"1rem 1.25rem"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:8}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{fontSize:11,fontWeight:600,color:"#534AB7"}}>{task.id}</span>
                    <TaskStatusBadge status={task.status}/><PriBadge priority={task.priority}/>
                    {overdue&&<Badge label="Overdue" bg="#FCEBEB" color="#791F1F"/>}
                  </div>
                  <div style={{fontSize:14,fontWeight:500,marginBottom:4}}>{task.title}</div>
                  {task.description&&<div style={{fontSize:12,color:"var(--color-text-secondary)",marginBottom:6}}>{task.description}</div>}
                  <div style={{display:"flex",gap:12,fontSize:12,color:"var(--color-text-secondary)",alignItems:"center",flexWrap:"wrap"}}>
                    {task.dueDate&&<span>Due {fmtShort(task.dueDate)}</span>}
                    <span style={{cursor:"pointer",color:"#534AB7",fontWeight:500}} onClick={()=>change&&onSelectChange(change)}>{task.changeId} — {task.changeTitle}</span>
                    {change&&<TypeBadge type={change.type}/>}
                  </div>
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  {task.status==="Open"&&<button onClick={()=>onUpdateTask(task.changeId,task.id,{status:"In Progress"})} style={{fontSize:11,padding:"5px 10px",cursor:"pointer",background:"#FAEEDA",color:"#854F0B",border:"0.5px solid #854F0B",borderRadius:6,fontWeight:500,whiteSpace:"nowrap"}}>Start</button>}
                  {task.status==="In Progress"&&<button onClick={()=>onUpdateTask(task.changeId,task.id,{status:"Completed"})} style={{fontSize:11,padding:"5px 10px",cursor:"pointer",background:"#EAF3DE",color:"#27500A",border:"0.5px solid #27500A",borderRadius:6,fontWeight:500,whiteSpace:"nowrap"}}>Complete</button>}
                  {!["Completed","Cancelled"].includes(task.status)&&<button onClick={()=>onUpdateTask(task.changeId,task.id,{status:"Cancelled"})} style={{fontSize:11,padding:"5px 10px",cursor:"pointer",background:"#F1EFE8",color:"#888780",border:"0.5px solid #888780",borderRadius:6,fontWeight:500}}>Cancel</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
