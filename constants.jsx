// ── Type / stage / risk enumerations ─────────────────────────────────────────
export const CHANGE_TYPES  = ["Standard","Normal","Emergency"];
export const RISK_LEVELS   = ["Low","Medium","High","Critical"];
export const ROLES         = ["Requester","Change Manager","CAB Approver"];
export const STAGES        = ["New","Awaiting CAB","Approved","Implementation","Review","Completed"];
export const TASK_STATUSES = ["Open","In Progress","Completed","Cancelled"];
export const ALL_USERS     = ["Current User","Alice Johnson","Bob Smith","Carol White","Frank Green","Grace Lee","Dave Brown","Eve Davis","Mike Chen"];

// ── Colour tokens ─────────────────────────────────────────────────────────────
export const SLATE = {
  "--color-background-primary":   "#f8fafc",
  "--color-background-secondary": "#f1f5f9",
  "--color-background-tertiary":  "#e2e8f0",
  "--color-text-primary":         "#0f172a",
  "--color-text-secondary":       "#475569",
  "--color-text-tertiary":        "#94a3b8",
  "--color-border-tertiary":      "rgba(15,23,42,0.08)",
  "--color-border-secondary":     "rgba(15,23,42,0.14)",
};

export const STAGE_C  = {New:"#185FA5","Awaiting CAB":"#534AB7",Approved:"#27500A",Rejected:"#791F1F",Implementation:"#854F0B",Review:"#0C447C",Completed:"#085041"};
export const STAGE_BG = {New:"#E6F1FB","Awaiting CAB":"#EEEDFE",Approved:"#EAF3DE",Rejected:"#FCEBEB",Implementation:"#FAEEDA",Review:"#E6F1FB",Completed:"#E1F5EE"};
export const OUT_C    = {Successful:"#27500A","Unsuccessful":"#791F1F","Successful with issues":"#854F0B"};
export const OUT_BG   = {Successful:"#EAF3DE","Unsuccessful":"#FCEBEB","Successful with issues":"#FAEEDA"};
export const T_C      = {Standard:"#0C447C",Normal:"#3C3489",Emergency:"#791F1F"};
export const T_BG     = {Standard:"#E6F1FB",Normal:"#EEEDFE",Emergency:"#FCEBEB"};
export const RISK_C   = {Low:"#27500A",Medium:"#633806",High:"#854F0B",Critical:"#791F1F"};
export const RISK_BG  = {Low:"#EAF3DE",Medium:"#FAEEDA",High:"#FAEEDA",Critical:"#FCEBEB"};
export const BAR_C    = {Standard:"#378ADD",Normal:"#7F77DD",Emergency:"#E24B4A"};
export const TASK_SC  = {Open:"#185FA5","In Progress":"#854F0B",Completed:"#085041",Cancelled:"#888780"};
export const TASK_SBG = {Open:"#E6F1FB","In Progress":"#FAEEDA",Completed:"#E1F5EE",Cancelled:"#F1EFE8"};
export const PRI_C    = {High:"#854F0B",Medium:"#534AB7",Low:"#888780"};
export const PRI_BG   = {High:"#FAEEDA",Medium:"#EEEDFE",Low:"#F1EFE8"};
export const TMPL_C   = {"Pending CAB Approval":"#534AB7",Approved:"#27500A",Rejected:"#791F1F"};
export const TMPL_BG  = {"Pending CAB Approval":"#EEEDFE",Approved:"#EAF3DE",Rejected:"#FCEBEB"};

// ── User mapping ──────────────────────────────────────────────────────────────
export const USER_NAMES  = {"Requester":"Alice Johnson","Change Manager":"Liam Mainwaring","CAB Approver":"Jordan Faith"};
export const USER_EMAILS = {"Requester":"steven.loxton@ogi.wales","Change Manager":"liam.mainwaring@ogi.wales","CAB Approver":"jordan.faith@ogi.wales"};

// ── Utility functions ─────────────────────────────────────────────────────────
export function daysFromNow(d,h=9,m=0){const dt=new Date();dt.setDate(dt.getDate()+d);dt.setHours(h,m,0,0);return dt.toISOString().slice(0,16);}
export function fmtDate(d){if(!d)return"—";return new Date(d).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});}
export function fmtShort(d){if(!d)return"—";return new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short"});}
export function nowISO(){return new Date().toISOString().slice(0,16);}
export function oneWeekAgo(){const d=new Date();d.setDate(d.getDate()-7);return d;}
export function clashCheck(c,all){
  if(!c.plannedStart||!c.plannedEnd)return[];
  const s=new Date(c.plannedStart).getTime(),e=new Date(c.plannedEnd).getTime();
  return all.filter(x=>{
    if(x.id===c.id||!x.plannedStart||!x.plannedEnd)return false;
    if(["Rejected","Completed"].includes(x.stage))return false;
    return s<new Date(x.plannedEnd).getTime()&&e>new Date(x.plannedStart).getTime();
  });
}

// ── Form initialisers ─────────────────────────────────────────────────────────
export const initForm = ()=>({title:"",type:"Standard",templateId:null,description:"",justification:"",risk:"Low",impact:"",plannedStart:"",plannedEnd:"",rollback:"",service:"",attachments:[]});
export const initTask = ()=>({title:"",description:"",assignedTo:"Alice Johnson",dueDate:"",priority:"Medium"});
export const initTmpl = ()=>({title:"",description:"",justification:"",risk:"Low",rollback:"",service:"",rationale:""});

// ── Navigation ────────────────────────────────────────────────────────────────
export const NAV = [
  {id:"dashboard", label:"Dashboard",         icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" fill="currentColor" opacity=".7"/><rect x="10" y="2" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="2" y="10" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="10" y="10" width="6" height="6" rx="1.5" fill="currentColor" opacity=".4"/></svg>},
  {id:"cab",       label:"CAB Board",          icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M3 16c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>},
  {id:"fsc",       label:"Forward Schedule",   icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="4" width="16" height="2" rx="1" fill="currentColor" opacity=".3"/><rect x="1" y="8" width="16" height="2" rx="1" fill="currentColor" opacity=".3"/><rect x="1" y="12" width="16" height="2" rx="1" fill="currentColor" opacity=".3"/><rect x="3" y="3" width="6" height="4" rx="1" fill="currentColor"/><rect x="8" y="7" width="7" height="4" rx="1" fill="currentColor"/><rect x="2" y="11" width="5" height="4" rx="1" fill="currentColor"/></svg>},
  {id:"register",  label:"Change Register",    icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="2" rx="1" fill="currentColor"/><rect x="2" y="8" width="14" height="2" rx="1" fill="currentColor"/><rect x="2" y="13" width="9" height="2" rx="1" fill="currentColor"/></svg>},
  {id:"mychanges", label:"My Changes",         icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M4 15c0-2.761 2.239-4 5-4s5 1.239 5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="7" r="1" fill="currentColor"/></svg>},
  {id:"mytasks",   label:"My Tasks",           icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>},
  {id:"templates", label:"Standard Templates", icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="4" rx="1.5" fill="currentColor" opacity=".7"/><rect x="2" y="8" width="8" height="2.5" rx="1" fill="currentColor"/><rect x="2" y="12" width="11" height="2.5" rx="1" fill="currentColor" opacity=".5"/></svg>},
  {id:"history",   label:"Change History",     icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 4v5l3.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 9a6 6 0 1 0 1-3.3M3 4v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>},
];

// ── Seed data ─────────────────────────────────────────────────────────────────
export const SEED_TEMPLATES = [
  {id:"SCT001",title:"Monthly OS Security Patching",description:"Apply monthly cumulative security patches to all application servers during approved maintenance window. Servers are patched sequentially with validation checks between each.",justification:"Routine monthly patching cycle in line with security policy SEC-007. Patches are pre-tested in staging environment.",risk:"Low",rollback:"Uninstall patches via WSUS and restore from pre-patch snapshot if validation fails.",service:"Application Hosting",status:"Approved",proposedBy:"Alice Johnson",proposedAt:"2025-01-15",approvedAt:"2025-01-22",usageCount:14},
  {id:"SCT002",title:"SSL/TLS Certificate Renewal",description:"Renew expiring SSL/TLS certificates for customer-facing web services via automated ACME protocol with manual fallback. Zero downtime expected.",justification:"Certificates renewed 30 days before expiry as per security policy. Process is well-established with zero incident history.",risk:"Low",rollback:"Restore previous certificate from secure certificate store.",service:"Web Services",status:"Approved",proposedBy:"Bob Smith",proposedAt:"2025-02-01",approvedAt:"2025-02-08",usageCount:6},
  {id:"SCT003",title:"Firewall Rule Addition — Cloud Provider IP Ranges",description:"Add ingress/egress firewall rules to permit traffic from approved cloud provider IP ranges. Rules added without removing existing rules.",justification:"New cloud services onboarded via standard procurement require network access.",risk:"Low",rollback:"Remove newly added rules using saved rule backup taken immediately before change.",service:"Network Infrastructure",status:"Approved",proposedBy:"Frank Green",proposedAt:"2025-02-10",approvedAt:"2025-02-17",usageCount:8},
  {id:"SCT004",title:"DNS Record Update",description:"Create, modify, or delete DNS records for approved services. Changes staged and validated before TTL propagation.",justification:"DNS changes are low-risk, fully reversible and required as part of standard service onboarding and offboarding.",risk:"Low",rollback:"Revert DNS record to previous value. TTL set to 300 seconds before change.",service:"DNS & Naming",status:"Approved",proposedBy:"Carol White",proposedAt:"2025-03-01",approvedAt:"2025-03-07",usageCount:22},
  {id:"SCT005",title:"Database Index Rebuild",description:"Rebuild fragmented indexes on reporting and analytics databases during off-peak hours. Non-destructive, runs with ONLINE=ON.",justification:"Index fragmentation above 30% threshold causes measurable query performance degradation.",risk:"Low",rollback:"No rollback required — index rebuild is non-destructive.",service:"Reporting Platform",status:"Approved",proposedBy:"Grace Lee",proposedAt:"2025-03-15",approvedAt:"2025-03-20",usageCount:5},
  {id:"SCT006",title:"BGP Peer Addition — Transit Provider",description:"Add a new BGP peer session with an approved transit or peering provider. Session configured in passive mode initially, validated with test prefixes.",justification:"Standard process for onboarding new transit providers and peering relationships.",risk:"Medium",rollback:"Tear down BGP session and remove peer configuration.",service:"Core Network",status:"Approved",proposedBy:"Frank Green",proposedAt:"2025-04-01",approvedAt:"2025-04-10",usageCount:3},
  {id:"SCT007",title:"VLAN Provisioning — Customer Access",description:"Provision a new customer access VLAN on edge and aggregation switches. VLAN created, tagged on trunk ports, validated with test traffic.",justification:"VLAN provisioning is a routine operation performed multiple times per week as part of customer onboarding.",risk:"Low",rollback:"Remove VLAN from all switch ports and delete VLAN database entry.",service:"Access Network",status:"Approved",proposedBy:"Dave Brown",proposedAt:"2025-04-15",approvedAt:"2025-04-20",usageCount:31},
  {id:"SCT008",title:"Automated Backup Verification",description:"Run monthly backup verification test: restore selected backup sets to isolated environment, validate data integrity.",justification:"Backup verification is a compliance requirement under ISO 27001 control A.12.3.1.",risk:"Low",rollback:"No rollback required — verification performed in isolated environment.",service:"Backup & Recovery",status:"Approved",proposedBy:"Alice Johnson",proposedAt:"2025-05-01",approvedAt:"2025-05-06",usageCount:2},
];

export const SEED_CHANGES = [
  {id:"CHG0001",type:"Normal",title:"Upgrade SQL Server 2019 to 2022",description:"Upgrade production SQL Server instance to 2022.",justification:"End of extended support approaching.",risk:"High",impact:"Production database unavailable.",plannedStart:daysFromNow(1,22),plannedEnd:daysFromNow(2,2),actualStart:null,actualEnd:null,rollback:"Restore from pre-upgrade snapshot.",service:"Core Database Platform",requester:"Current User",stage:"Awaiting CAB",outcome:null,reviewNotes:null,attachments:[],tasks:[],templateId:null},
  {id:"CHG0002",type:"Standard",title:"Deploy application security patches",description:SEED_TEMPLATES[0].description,justification:SEED_TEMPLATES[0].justification,risk:"Low",impact:"Brief service interruption.",plannedStart:daysFromNow(1,23),plannedEnd:daysFromNow(2,1),actualStart:null,actualEnd:null,rollback:SEED_TEMPLATES[0].rollback,service:"Application Hosting",requester:"Alice Johnson",stage:"Awaiting CAB",outcome:null,reviewNotes:null,attachments:[],tasks:[],templateId:"SCT001"},
  {id:"CHG0003",type:"Emergency",title:"Hotfix for authentication bypass vulnerability",description:"Critical security vulnerability.",justification:"CVE-2025-1234 confirmed exploitable.",risk:"Critical",impact:"~2 min outage.",plannedStart:daysFromNow(-3,15),plannedEnd:daysFromNow(-3,16),actualStart:daysFromNow(-3,15),actualEnd:daysFromNow(-3,15),rollback:"Revert to previous build.",service:"Identity & Access Management",requester:"Current User",stage:"Completed",outcome:"Successful",reviewNotes:"Patch applied successfully.",attachments:[],tasks:[],templateId:null},
  {id:"CHG0004",type:"Standard",title:"Renew customer portal SSL certificate",description:SEED_TEMPLATES[1].description,justification:SEED_TEMPLATES[1].justification,risk:"Low",impact:"Zero downtime.",plannedStart:daysFromNow(4,10),plannedEnd:daysFromNow(4,11),actualStart:null,actualEnd:null,rollback:SEED_TEMPLATES[1].rollback,service:"Web Services",requester:"Current User",stage:"Approved",outcome:null,reviewNotes:null,attachments:[],tasks:[],templateId:"SCT002"},
  {id:"CHG0005",type:"Normal",title:"Migrate file server to new SAN",description:"Migrate file server data from legacy SAN.",justification:"Legacy SAN approaching end of life.",risk:"High",impact:"File server offline during migration.",plannedStart:daysFromNow(2,1),plannedEnd:daysFromNow(2,5),actualStart:null,actualEnd:null,rollback:"Reconnect legacy SAN.",service:"File Services",requester:"Current User",stage:"New",outcome:null,reviewNotes:null,attachments:[],tasks:[],templateId:null},
  {id:"CHG0007",type:"Normal",title:"Database index optimisation",description:"Rebuild fragmented indexes across reporting databases.",justification:"Query performance degraded 40%.",risk:"Low",impact:"Reporting queries slower during rebuild.",plannedStart:daysFromNow(5,1),plannedEnd:daysFromNow(5,4),actualStart:daysFromNow(5,1),actualEnd:null,rollback:"Non-destructive — no rollback needed.",service:"Reporting Platform",requester:"Current User",stage:"Implementation",outcome:null,reviewNotes:null,attachments:[],tasks:[{id:"TASK0001",title:"Monitor query performance during rebuild",description:"Track query response times.",assignedTo:"Current User",dueDate:daysFromNow(5,6),priority:"Medium",status:"Open",createdBy:"Current User"}],templateId:null},
];
