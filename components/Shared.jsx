import { STAGE_BG, STAGE_C, T_BG, T_C, RISK_BG, RISK_C, OUT_BG, OUT_C, TASK_SBG, TASK_SC, PRI_BG, PRI_C, TMPL_BG, TMPL_C } from "../constants.jsx";

// ── Generic badge ─────────────────────────────────────────────────────────────
export function Badge({label,bg,color,size="sm"}){
  return (
    <span style={{background:bg,color,fontSize:size==="sm"?"11px":"12px",fontWeight:500,padding:"3px 9px",borderRadius:20,whiteSpace:"nowrap",letterSpacing:"0.01em"}}>{label}</span>
  );
}

export function StageBadge({stage,size})  {return <Badge label={stage}    bg={STAGE_BG[stage]}  color={STAGE_C[stage]}  size={size}/> ;}
export function TypeBadge({type})         {return <Badge label={type}     bg={T_BG[type]}       color={T_C[type]}/> ;}
export function RiskBadge({risk})         {return <Badge label={risk}     bg={RISK_BG[risk]}    color={RISK_C[risk]}/> ;}
export function OutcomeBadge({outcome})   {return <Badge label={outcome}  bg={OUT_BG[outcome]}  color={OUT_C[outcome]}/> ;}
export function TaskStatusBadge({status}) {return <Badge label={status}   bg={TASK_SBG[status]} color={TASK_SC[status]}/> ;}
export function PriBadge({priority})      {return <Badge label={priority} bg={PRI_BG[priority]} color={PRI_C[priority]}/> ;}
export function TmplBadge({status})       {return <Badge label={status}   bg={TMPL_BG[status]}  color={TMPL_C[status]}/> ;}

// ── Field row for detail views ────────────────────────────────────────────────
export function FieldRow({label,value}){
  return (
    <div style={{padding:"10px 0",borderBottom:"0.5px solid var(--color-border-tertiary)",display:"grid",gridTemplateColumns:"148px 1fr",gap:12,alignItems:"start"}}>
      <span style={{fontSize:12,color:"var(--color-text-secondary)",fontWeight:500,paddingTop:1}}>{label}</span>
      <span style={{fontSize:13,lineHeight:1.6}}>{value||"—"}</span>
    </div>
  );
}
