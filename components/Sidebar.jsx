import { NAV, USER_NAMES } from "../constants.jsx";

const SM = "rgba(255,255,255,0.5)";

export default function Sidebar({view,role,pendingCABCount,openTaskCount,pendingTmplCount,onNavigate,onSignOut}){
  const userName      = USER_NAMES[role];
  const userInitials  = role==="Requester"?"RE":role==="Change Manager"?"CM":"CA";

  return (
    <div style={{width:220,flexShrink:0,background:"#1a1a2e",display:"flex",flexDirection:"column",minHeight:"100vh",position:"sticky",top:0}}>
      <div style={{padding:"20px 20px 16px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
        <svg width="52" height="32" viewBox="0 0 52 32" fill="none">
          <rect width="52" height="32" rx="7" fill="#E8312A"/>
          <text x="26" y="23" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="18" fill="white" letterSpacing="-0.5">ogi</text>
        </svg>
        <div style={{fontSize:11,color:SM,marginTop:8,fontWeight:500,letterSpacing:"0.06em",textTransform:"uppercase"}}>Change Management</div>
      </div>

      <nav style={{padding:"12px 10px",flex:1}}>
        {NAV.map(({id,label,icon})=>{
          const active = view===id;
          const badge  = id==="cab"&&pendingCABCount>0?pendingCABCount
                       : id==="mytasks"&&openTaskCount>0?openTaskCount
                       : id==="templates"&&pendingTmplCount>0?pendingTmplCount
                       : null;
          return (
            <button key={id} onClick={()=>onNavigate(id)}
              onMouseEnter={e=>{if(!active){e.currentTarget.style.background="rgba(255,255,255,0.07)";e.currentTarget.style.color="white";}}}
              onMouseLeave={e=>{if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color=SM;}}}
              style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 12px",marginBottom:2,borderRadius:10,border:"none",background:active?"rgba(255,255,255,0.12)":"transparent",color:active?"white":SM,cursor:"pointer",textAlign:"left",fontSize:13,fontWeight:active?500:400,position:"relative"}}>
              {active&&<span style={{position:"absolute",left:0,top:"20%",bottom:"20%",width:3,background:"#E8312A",borderRadius:"0 2px 2px 0"}}/>}
              <span style={{display:"flex",flexShrink:0}}>{icon}</span>
              <span style={{flex:1}}>{label}</span>
              {badge&&<span style={{background:"#E8312A",color:"white",fontSize:10,fontWeight:600,padding:"1px 6px",borderRadius:10}}>{badge}</span>}
            </button>
          );
        })}
      </nav>

      <div style={{padding:"12px 10px",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:"rgba(255,255,255,0.06)",borderRadius:10,marginBottom:8}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:"#E8312A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"white",flexShrink:0}}>
            {userInitials}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:500,color:"white",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{userName}</div>
            <div style={{fontSize:10,color:SM,marginTop:1}}>{role}</div>
          </div>
        </div>
        <button
          onClick={onSignOut}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.09)";e.currentTarget.style.color="white";}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.color=SM;}}
          style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,border:"none",background:"rgba(255,255,255,0.04)",color:SM,cursor:"pointer",fontSize:12}}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2H2.5A1.5 1.5 0 0 0 1 3.5v7A1.5 1.5 0 0 0 2.5 12H5M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Sign out
        </button>
      </div>
    </div>
  );
}
