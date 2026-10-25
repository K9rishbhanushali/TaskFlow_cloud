import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Presentation, PresentationFile } from 'file:///C:/Users/KRISH/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';

const workspaceDir = process.cwd();
const skillDir = 'C:/Users/KRISH/.codex/plugins/cache/openai-primary-runtime/presentations/26.1024.11018/skills/presentations';
const runtimePython = 'C:/Users/KRISH/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const buildDir = path.join(workspaceDir, '.ppt-build');
const previewDir = path.join(buildDir, 'previews');
const outDir = path.join(workspaceDir, 'output', 'pptx');
const finalPath = path.join(outDir, 'TaskFlow_Cloud_AWS_Services_final.pptx');
await fs.mkdir(previewDir, { recursive: true });
await fs.mkdir(outDir, { recursive: true });

const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const C = { navy:'#102A43', blue:'#146EB4', sky:'#EAF5FB', pale:'#F7FAFC', ink:'#102A43', muted:'#486581', orange:'#FF9900', green:'#2F855A', line:'#B7C9D6', white:'#FFFFFF' };
const W=1280, H=720;

function box(s,x,y,w,h,fill=C.white,r=18,line='none') { const cfg={geometry:r===0?'rect':'roundRect',position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:line==='none'?'none':line,width:line==='none'?0:1}}; if(r!==0) cfg.borderRadius='rounded-xl'; return s.shapes.add(cfg); }
function text(s, str,x,y,w,h,size=20,color=C.ink,bold=false,align='left') { const z=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{style:'solid',fill:'none',width:0}}); z.text=str; z.text.style={fontSize:size,fontFamily:'Aptos',color,bold,alignment:align,verticalAlignment:'middle',marginLeft:0,marginRight:0,marginTop:0,marginBottom:0}; return z; }
function title(s, str, n) { text(s,str,70,48,1000,48,32,C.navy,true); text(s,`TASKFLOW CLOUD  /  ${String(n).padStart(2,'0')}`,70,17,360,18,10,C.muted,true); text(s,String(n),1150,56,60,22,12,C.muted,true,'right'); }
function footer(s) { text(s,'Cloud computing project presentation',70,684,360,16,10,C.muted); }
function bulletList(s,items,x,y,w,size=18,color=C.ink,gap=38){items.forEach((v,i)=>{text(s,'•',x,y+i*gap,16,26,size,color,true);text(s,v,x+25,y+i*gap,w-25,28,size,color,false);});}
function serviceTag(s,label,x,y,color){box(s,x,y,145,34,color,10);text(s,label,x,y+7,145,18,13,C.white,true,'center');}
function notes(slide, value){ if(slide.notes) slide.notes.text=value; }

// 1
{const s=deck.slides.add();s.background.fill=C.pale;box(s,0,0,1280,720,C.navy,0);box(s,760,0,520,720,C.blue,0);text(s,'TaskFlow Cloud',72,126,620,70,48,C.white,true);text(s,'AWS Amplify, Amazon EC2 and Amazon RDS',72,207,610,62,27,'#D9EAF7',false);text(s,'How the cloud services support a student task and study management system',72,292,570,78,20,C.white,false);text(s,'Cloud Computing  |  Shah & Anchor Kutchhi Engineering College',72,618,580,24,13,'#C7D7E3');
  box(s,825,150,305,94,C.white,18);text(s,'Frontend',850,168,250,24,17,C.blue,true);text(s,'AWS Amplify',850,198,250,28,23,C.navy,true);
  box(s,825,277,305,94,C.white,18);text(s,'Application server',850,295,250,24,17,C.blue,true);text(s,'Amazon EC2',850,325,250,28,23,C.navy,true);
  box(s,825,404,305,94,C.white,18);text(s,'Relational database',850,422,250,24,17,C.blue,true);text(s,'Amazon RDS',850,452,250,28,23,C.navy,true);
}
// 2
{const s=deck.slides.add();s.background.fill=C.pale;title(s,'TaskFlow Cloud project',2);footer(s);text(s,'A web application for students to plan academic work and monitor progress',70,120,760,35,22,C.muted);box(s,70,195,510,380,C.white,18,C.line);text(s,'Student capabilities',100,225,380,30,23,C.navy,true);bulletList(s,['Create, edit and complete personal tasks','Filter by subject, priority, status and due date','View dashboard totals and upcoming work','Upload and manage study files'],100,280,430,18);
box(s,640,195,570,380,C.navy,18);text(s,'Why cloud services matter',682,225,400,30,23,C.white,true);text(s,'TaskFlow separates the browser interface, API processing and database records. Each layer has a clear responsibility in the planned AWS deployment.',682,278,450,105,19,'#D9EAF7');serviceTag(s,'AMPLIFY',682,430,C.orange);serviceTag(s,'EC2',850,430,C.blue);serviceTag(s,'RDS',1018,430,C.green);}
// 3
{const s=deck.slides.add();s.background.fill=C.white;title(s,'Planned TaskFlow Cloud architecture',3);footer(s);text(s,'The report describes a cloud-ready design. It does not claim a live AWS deployment.',70,105,1050,28,18,C.muted);const xs=[75,400,725,1050];const names=['Student browser','AWS Amplify','Amazon EC2','Amazon RDS'];const subs=['React interface','Hosts the frontend','Runs Flask API','Stores PostgreSQL data'];const fills=[C.sky,'#FFF2D6','#E8F2FB','#E6F5EC'];for(let i=0;i<4;i++){box(s,xs[i],260,180,150,fills[i],18,C.line);text(s,names[i],xs[i]+16,290,148,28,20,C.navy,true,'center');text(s,subs[i],xs[i]+16,332,148,40,15,C.muted,false,'center');if(i<3){text(s,'→',xs[i]+192,315,42,35,30,C.blue,true,'center');}}text(s,'HTTPS requests',264,450,200,26,16,C.muted,true,'center');text(s,'REST and JSON',590,450,200,26,16,C.muted,true,'center');text(s,'SQL queries',914,450,200,26,16,C.muted,true,'center');}
// 4
{const s=deck.slides.add();s.background.fill=C.pale;title(s,'AWS Amplify',4);footer(s);serviceTag(s,'AWS AMPLIFY',70,116,C.orange);text(s,'A managed service for building and hosting web applications',70,170,650,72,32,C.navy,true);text(s,'Amplify can host a static web frontend, connect deployments to a source repository, and provide a public HTTPS address for the application.',70,270,580,105,20,C.ink);box(s,770,150,365,315,C.white,18,C.line);text(s,'Amplify responsibilities',805,185,280,30,22,C.navy,true);bulletList(s,['Build the React frontend','Publish static files','Serve the web app over HTTPS'],805,245,290,17,C.ink,55);text(s,'Frontend hosting layer',770,510,365,28,16,C.muted,false,'center');}
// 5
{const s=deck.slides.add();s.background.fill=C.white;title(s,'AWS Amplify in TaskFlow Cloud',5);footer(s);text(s,'TaskFlow uses Amplify as the planned home for the React and Vite frontend.',70,112,840,30,21,C.muted);box(s,70,185,340,310,'#FFF7E6',18);text(s,'What users receive',102,220,270,30,22,C.navy,true);bulletList(s,['Login and registration pages','Task list and dashboard','Profile and file screens'],102,280,250,17,C.ink,50);box(s,470,185,340,310,C.sky,18);text(s,'What Amplify does',502,220,270,30,22,C.navy,true);bulletList(s,['Builds the Vite production bundle','Hosts static frontend files','Delivers the browser application'],502,280,250,17,C.ink,50);box(s,870,185,340,310,'#EAF7F0',18);text(s,'Project benefit',902,220,270,30,22,C.navy,true);bulletList(s,['No server setup for the UI','HTTPS hosting path','Clear separation from the API'],902,280,250,17,C.ink,50);}
// 6
{const s=deck.slides.add();s.background.fill=C.pale;title(s,'Amazon EC2',6);footer(s);serviceTag(s,'AMAZON EC2',70,116,C.blue);text(s,'Virtual servers that run application software in AWS',70,170,670,54,31,C.navy,true);text(s,'EC2 provides compute capacity. Teams choose an instance, install the required software and run the application process on the server.',70,252,610,90,20,C.ink);box(s,775,150,370,340,C.white,18,C.line);text(s,'Typical EC2 software stack',810,185,285,30,22,C.navy,true);text(s,'Nginx',810,242,285,28,20,C.blue,true);text(s,'Gunicorn',810,296,285,28,20,C.blue,true);text(s,'Flask API',810,350,285,28,20,C.blue,true);text(s,'Linux instance and security group',810,414,285,24,15,C.muted);}
// 7
{const s=deck.slides.add();s.background.fill=C.white;title(s,'Amazon EC2 in TaskFlow Cloud',7);footer(s);text(s,'The planned EC2 instance hosts the Flask REST API.',70,112,800,32,22,C.muted);box(s,90,195,260,265,C.sky,18);text(s,'1  Request',120,230,200,30,22,C.navy,true);text(s,'The browser sends an authenticated API request.',120,280,190,80,18,C.ink);box(s,510,195,260,265,'#E8F2FB',18);text(s,'2  API logic',540,230,200,30,22,C.navy,true);text(s,'Flask validates JWT identity and applies task rules.',540,280,190,80,18,C.ink);box(s,930,195,260,265,'#E6F5EC',18);text(s,'3  Response',960,230,200,30,22,C.navy,true);text(s,'The API returns JSON for the React interface.',960,280,190,80,18,C.ink);text(s,'→',365,285,100,40,32,C.blue,true,'center');text(s,'→',785,285,100,40,32,C.blue,true,'center');text(s,'The API also controls access to private tasks and study-file actions.',190,535,900,32,19,C.muted,false,'center');}
// 8
{const s=deck.slides.add();s.background.fill=C.pale;title(s,'Amazon RDS',8);footer(s);serviceTag(s,'AMAZON RDS',70,116,C.green);text(s,'A managed relational database service',70,170,640,48,32,C.navy,true);text(s,'RDS provides managed database instances. For TaskFlow, PostgreSQL is the planned production database while SQLite supports local development.',70,252,620,84,20,C.ink);box(s,790,145,350,350,C.white,18,C.line);text(s,'RDS database responsibilities',825,185,270,30,22,C.navy,true);bulletList(s,['Store structured application data','Maintain relationships between records','Support backups and access controls'],825,245,250,17,C.ink,55);}
// 9
{const s=deck.slides.add();s.background.fill=C.white;title(s,'Amazon RDS in TaskFlow Cloud',9);footer(s);text(s,'PostgreSQL on RDS stores the data that the API needs for each student.',70,112,930,32,21,C.muted);const cols=[['users','id, name, email\npassword hash'],['tasks','title, subject, priority\nstatus, due date'],['study_files','file metadata\nowner and task link']];cols.forEach((a,i)=>{let x=105+i*380;box(s,x,220,300,230,i===0?C.sky:(i===1?'#FFF7E6':'#EAF7F0'),18,C.line);text(s,a[0],x+25,255,250,32,23,C.navy,true,'center');text(s,a[1],x+25,320,250,65,18,C.ink,false,'center');});text(s,'Each API query uses the authenticated user identity to scope private records.',105,525,1030,34,20,C.muted,false,'center');}
// 10
{const s=deck.slides.add();s.background.fill=C.pale;title(s,'Task creation flow',10);footer(s);text(s,'Example: a student creates a task from the browser.',70,112,900,32,21,C.muted);const steps=[['1','React form','Student enters task details'],['2','EC2 API','Flask validates the request'],['3','RDS database','PostgreSQL saves the task'],['4','Dashboard','API returns updated task data']];steps.forEach((a,i)=>{let x=70+i*295;box(s,x,245,230,210,C.white,18,C.line);text(s,a[0],x+22,270,38,36,27,C.blue,true);text(s,a[1],x+22,325,186,30,20,C.navy,true);text(s,a[2],x+22,370,186,52,16,C.ink);if(i<3)text(s,'→',x+235,330,50,35,29,C.blue,true,'center');});text(s,'Amplify hosts the React frontend where this workflow begins.',70,535,1140,34,20,C.muted,false,'center');}
// 11
{const s=deck.slides.add();s.background.fill=C.navy;title(s,'Service roles and project status',11);text(s,'TaskFlow Cloud maps each service to a specific layer.',70,118,800,34,22,'#D9EAF7');const rows=[['AWS Amplify','React frontend hosting',C.orange],['Amazon EC2','Flask API compute',C.blue],['Amazon RDS','PostgreSQL data storage',C.green]];rows.forEach((r,i)=>{let y=200+i*94;box(s,100,y,280,62,r[2],14);text(s,r[0],120,y+17,240,28,20,C.white,true,'center');text(s,r[1],430,y+18,360,28,21,C.white,false);});box(s,870,200,300,250,'#173B5C',18);text(s,'Project status',900,230,240,30,22,C.white,true);text(s,'The report documents this AWS architecture as cloud-ready. Local testing used the React, Flask and SQLite development setup.',900,285,230,105,18,'#D9EAF7');text(s,'Thank you',70,620,250,38,28,C.white,true);text(s,'Questions',1040,620,150,32,18,'#D9EAF7',false,'right');}

const candidate = path.join(buildDir,'candidate.pptx');
await (await PresentationFile.exportPptx(deck)).save(candidate);
for (const [i, slide] of deck.slides.items.entries()) {
  const png = await deck.export({slide,format:'png',scale:1});
  await fs.writeFile(path.join(previewDir,`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));
}
const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir,'container_tools','artifact_tool_utils.mjs')).href);
await finalizePresentation({
  explicitTotalSlideCount:11,
  requiredNativeTableOwnerSlides:[],
  workspaceDir,
  candidatePath:candidate,
  finalPath,
  pythonExecutable:runtimePython,
  integrityValidatorPath:path.join(skillDir,'container_tools','inspect_presentation_package_integrity.py'),
  layoutValidatorPath:path.join(skillDir,'container_tools','inspect_presentation_layout_geometry.py'),
  layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],
  fontPolicy:{basis:'design',families:['Aptos']},
  verifyArtifactToolImport:true,
  receiptPath:path.join(buildDir,'validation-final.json')
});
