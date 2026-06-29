import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysFromNow(d, h = 9, m = 0) {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  dt.setHours(h, m, 0, 0);
  return dt.toISOString().slice(0, 16);
}

const TEMPLATES = [
  {id:"SCT001",title:"Monthly OS Security Patching",description:"Apply monthly cumulative security patches to all application servers during approved maintenance window. Servers are patched sequentially with validation checks between each.",justification:"Routine monthly patching cycle in line with security policy SEC-007. Patches are pre-tested in staging environment.",risk:"Low",rollback:"Uninstall patches via WSUS and restore from pre-patch snapshot if validation fails.",service:"Application Hosting",status:"Approved",proposedBy:"Alice Johnson",proposedAt:"2025-01-15",approvedAt:"2025-01-22",usageCount:14},
  {id:"SCT002",title:"SSL/TLS Certificate Renewal",description:"Renew expiring SSL/TLS certificates for customer-facing web services via automated ACME protocol with manual fallback. Zero downtime expected.",justification:"Certificates renewed 30 days before expiry as per security policy. Process is well-established with zero incident history.",risk:"Low",rollback:"Restore previous certificate from secure certificate store.",service:"Web Services",status:"Approved",proposedBy:"Bob Smith",proposedAt:"2025-02-01",approvedAt:"2025-02-08",usageCount:6},
  {id:"SCT003",title:"Firewall Rule Addition — Cloud Provider IP Ranges",description:"Add ingress/egress firewall rules to permit traffic from approved cloud provider IP ranges. Rules added without removing existing rules.",justification:"New cloud services onboarded via standard procurement require network access.",risk:"Low",rollback:"Remove newly added rules using saved rule backup taken immediately before change.",service:"Network Infrastructure",status:"Approved",proposedBy:"Frank Green",proposedAt:"2025-02-10",approvedAt:"2025-02-17",usageCount:8},
  {id:"SCT004",title:"DNS Record Update",description:"Create, modify, or delete DNS records for approved services. Changes staged and validated before TTL propagation.",justification:"DNS changes are low-risk, fully reversible and required as part of standard service onboarding and offboarding.",risk:"Low",rollback:"Revert DNS record to previous value. TTL set to 300 seconds before change.",service:"DNS & Naming",status:"Approved",proposedBy:"Carol White",proposedAt:"2025-03-01",approvedAt:"2025-03-07",usageCount:22},
  {id:"SCT005",title:"Database Index Rebuild",description:"Rebuild fragmented indexes on reporting and analytics databases during off-peak hours. Non-destructive, runs with ONLINE=ON.",justification:"Index fragmentation above 30% threshold causes measurable query performance degradation.",risk:"Low",rollback:"No rollback required — index rebuild is non-destructive.",service:"Reporting Platform",status:"Approved",proposedBy:"Grace Lee",proposedAt:"2025-03-15",approvedAt:"2025-03-20",usageCount:5},
  {id:"SCT006",title:"BGP Peer Addition — Transit Provider",description:"Add a new BGP peer session with an approved transit or peering provider. Session configured in passive mode initially, validated with test prefixes.",justification:"Standard process for onboarding new transit providers and peering relationships.",risk:"Medium",rollback:"Tear down BGP session and remove peer configuration.",service:"Core Network",status:"Approved",proposedBy:"Frank Green",proposedAt:"2025-04-01",approvedAt:"2025-04-10",usageCount:3},
  {id:"SCT007",title:"VLAN Provisioning — Customer Access",description:"Provision a new customer access VLAN on edge and aggregation switches. VLAN created, tagged on trunk ports, validated with test traffic.",justification:"VLAN provisioning is a routine operation performed multiple times per week as part of customer onboarding.",risk:"Low",rollback:"Remove VLAN from all switch ports and delete VLAN database entry.",service:"Access Network",status:"Approved",proposedBy:"Dave Brown",proposedAt:"2025-04-15",approvedAt:"2025-04-20",usageCount:31},
  {id:"SCT008",title:"Automated Backup Verification",description:"Run monthly backup verification test: restore selected backup sets to isolated environment, validate data integrity.",justification:"Backup verification is a compliance requirement under ISO 27001 control A.12.3.1.",risk:"Low",rollback:"No rollback required — verification performed in isolated environment.",service:"Backup & Recovery",status:"Approved",proposedBy:"Alice Johnson",proposedAt:"2025-05-01",approvedAt:"2025-05-06",usageCount:2},
];

const CHANGES = [
  {id:"CHG0001",type:"Normal",title:"Upgrade SQL Server 2019 to 2022",description:"Upgrade production SQL Server instance to 2022.",justification:"End of extended support approaching.",risk:"High",impact:"Production database unavailable.",plannedStart:daysFromNow(1,22),plannedEnd:daysFromNow(2,2),actualStart:null,actualEnd:null,rollback:"Restore from pre-upgrade snapshot.",service:"Core Database Platform",requester:"Alice Johnson",stage:"Awaiting CAB",outcome:null,reviewNotes:null,attachments:[],templateId:null,tasks:[]},
  {id:"CHG0002",type:"Standard",title:"Deploy application security patches",description:"Apply monthly cumulative security patches to all application servers during approved maintenance window. Servers are patched sequentially with validation checks between each.",justification:"Routine monthly patching cycle in line with security policy SEC-007. Patches are pre-tested in staging environment.",risk:"Low",impact:"Brief service interruption.",plannedStart:daysFromNow(1,23),plannedEnd:daysFromNow(2,1),actualStart:null,actualEnd:null,rollback:"Uninstall patches via WSUS and restore from pre-patch snapshot if validation fails.",service:"Application Hosting",requester:"Alice Johnson",stage:"Awaiting CAB",outcome:null,reviewNotes:null,attachments:[],templateId:"SCT001",tasks:[]},
  {id:"CHG0003",type:"Emergency",title:"Hotfix for authentication bypass vulnerability",description:"Critical security vulnerability.",justification:"CVE-2025-1234 confirmed exploitable.",risk:"Critical",impact:"~2 min outage.",plannedStart:daysFromNow(-3,15),plannedEnd:daysFromNow(-3,16),actualStart:daysFromNow(-3,15),actualEnd:daysFromNow(-3,15),rollback:"Revert to previous build.",service:"Identity & Access Management",requester:"Alice Johnson",stage:"Completed",outcome:"Successful",reviewNotes:"Patch applied successfully.",attachments:[],templateId:null,tasks:[]},
  {id:"CHG0004",type:"Standard",title:"Renew customer portal SSL certificate",description:"Renew expiring SSL/TLS certificates for customer-facing web services via automated ACME protocol with manual fallback. Zero downtime expected.",justification:"Certificates renewed 30 days before expiry as per security policy. Process is well-established with zero incident history.",risk:"Low",impact:"Zero downtime.",plannedStart:daysFromNow(4,10),plannedEnd:daysFromNow(4,11),actualStart:null,actualEnd:null,rollback:"Restore previous certificate from secure certificate store.",service:"Web Services",requester:"Alice Johnson",stage:"Approved",outcome:null,reviewNotes:null,attachments:[],templateId:"SCT002",tasks:[]},
  {id:"CHG0005",type:"Normal",title:"Migrate file server to new SAN",description:"Migrate file server data from legacy SAN.",justification:"Legacy SAN approaching end of life.",risk:"High",impact:"File server offline during migration.",plannedStart:daysFromNow(2,1),plannedEnd:daysFromNow(2,5),actualStart:null,actualEnd:null,rollback:"Reconnect legacy SAN.",service:"File Services",requester:"Alice Johnson",stage:"New",outcome:null,reviewNotes:null,attachments:[],templateId:null,tasks:[]},
  {id:"CHG0007",type:"Normal",title:"Database index optimisation",description:"Rebuild fragmented indexes across reporting databases.",justification:"Query performance degraded 40%.",risk:"Low",impact:"Reporting queries slower during rebuild.",plannedStart:daysFromNow(5,1),plannedEnd:daysFromNow(5,4),actualStart:daysFromNow(5,1),actualEnd:null,rollback:"Non-destructive — no rollback needed.",service:"Reporting Platform",requester:"Alice Johnson",stage:"Implementation",outcome:null,reviewNotes:null,attachments:[],templateId:null,tasks:[
    {id:"TASK0001",title:"Monitor query performance during rebuild",description:"Track query response times.",assignedTo:"Alice Johnson",dueDate:daysFromNow(5,6),priority:"Medium",status:"Open",createdBy:"Alice Johnson"},
  ]},
];

async function main() {
  console.log("Seeding database…");

  // Upsert templates
  for (const t of TEMPLATES) {
    await prisma.template.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        title: t.title,
        description: t.description,
        justification: t.justification || null,
        risk: t.risk,
        rollback: t.rollback || null,
        service: t.service || null,
        status: t.status,
        proposedBy: t.proposedBy || null,
        proposedAt: t.proposedAt || null,
        approvedAt: t.approvedAt || null,
        usageCount: t.usageCount || 0,
      },
    });
  }

  // Upsert changes (skip if already exists to avoid date drift)
  for (const c of CHANGES) {
    const { tasks, ...changeData } = c;
    await prisma.change.upsert({
      where: { id: c.id },
      update: {},
      create: {
        ...changeData,
        attachments: changeData.attachments || [],
        cabVotes: {},
      },
    });
    for (const t of tasks) {
      await prisma.task.upsert({
        where: { id: t.id },
        update: {},
        create: { ...t, changeId: c.id },
      });
    }
  }

  console.log("Done.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
