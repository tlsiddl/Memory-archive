const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const {parseHTML}=require(process.env.MEMORY_TEST_LINKEDOM || 'linkedom');
const C=require('./core.cjs');
test('v01012 DOM keeps separated narration visible under its own label without putting it in the quotation',async()=>{
 const {document,window}=parseHTML('<!DOCTYPE html><html><body></body></html>'),d=C.empty(),bag={'integrated-memory-v1:room1':d};let cleanup;d.records=[{id:'q',kind:'quote',text:'첫 음주 경험에 대한 응답',quote:'나 술 처음이야.',speaker:'한서래',channel:'spoken',sourceIds:['u'],quoteVerified:true,quoteContext:{before:'',meaning:'음주 경험을 밝혔다.',after:'더 이상 대꾸하지 않았다.',sourceType:'narration'}}];
 const ctx={console,setTimeout,clearTimeout,Request,Response,Headers,AbortController,URL,Blob,crypto,document,location:{href:'http://marinara.test/',origin:'http://marinara.test'},localStorage:{getItem:()=> 'room1'},confirm:()=>true,prompt:()=>null,fetch:async input=>String(input).endsWith('/api/chats/room1')?Response.json({id:'room1',name:'첫 만남'}):String(input).endsWith('/message-count')?Response.json({count:1}):String(input).includes('/connections')?Response.json([]):Response.json([{id:'u',role:'user',content:'"나 술 처음이야."\n더 이상 대꾸하지 않았다.'}]),marinara:{storage:{get:async()=>structuredClone(bag),patch:async data=>{Object.assign(bag,structuredClone(data));return {ok:true};}},onCleanup:fn=>cleanup=fn}};
 ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'core.cjs'),'utf8'),ctx);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'runtime.js'),'utf8'),ctx);if(!document.querySelector('#integrated-memory-extension'))document.dispatchEvent(new window.Event('DOMContentLoaded'));const root=document.querySelector('#integrated-memory-extension').shadowRoot,settle=()=>new Promise(resolve=>setImmediate(resolve));root.querySelector('#launch').onclick();for(let i=0;i<12;i++)await settle();root.querySelector('[data-tab=records]').dispatchEvent(new window.Event('click',{bubbles:true}));await settle();assert.equal(root.querySelector('blockquote').textContent,'나 술 처음이야.');assert(root.querySelector('.quote-context').textContent.includes('함께 기록된 지문·내면'));assert(root.querySelector('.quote-context').textContent.includes('더 이상 대꾸하지 않았다.'));cleanup();
});
test('real DOM: settings, source viewer and multiple events with multiple quotes',async()=>{
 const {document,window}=parseHTML('<!DOCTYPE html><html><body></body></html>');
 const bag={'integrated-memory-v1:room1':C.empty()};let cleanup,historyRows=null;
 const ctx={console,setTimeout,clearTimeout,Request,Response,Headers,AbortController,URL,Blob,crypto,document,location:{href:'http://marinara.test/',origin:'http://marinara.test'},localStorage:{getItem:()=> 'room1'},confirm:()=>true,prompt:()=>null,
 fetch:async input=>String(input).endsWith('/api/chats/room1')?Response.json({id:'room1',name:'병원의 밤'}):String(input).endsWith('/message-count')?Response.json({count:historyRows?.length||1}):String(input).includes('/connections')?Response.json([{id:'conn1',name:'model'}]):Response.json(historyRows||[{id:'u1',role:'user',name:'서래',content:'손바닥에 글을 썼다.'}]),
 marinara:{storage:{get:async()=>structuredClone(bag),patch:async data=>{Object.assign(bag,structuredClone(data));return {ok:true};}},onCleanup:fn=>cleanup=fn}};
 ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
 vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'core.cjs'),'utf8'),ctx);
 vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'runtime.js'),'utf8').replace('host.onCleanup?.(cleanup);','globalThis.setTestDiagnostic=value=>{lastExtractionDiagnostic=value;};host.onCleanup?.(cleanup);'),ctx);
 if(!document.querySelector('#integrated-memory-extension'))document.dispatchEvent(new window.Event('DOMContentLoaded'));
 const root=document.querySelector('#integrated-memory-extension').shadowRoot;
 const settle=()=>new Promise(resolve=>setImmediate(resolve));
 const click=selector=>root.querySelector(selector).dispatchEvent(new window.Event('click',{bubbles:true}));
 root.querySelector('#launch').onclick();await settle();await settle();
 if(!root.querySelector('#roomButton')?.disabled){}else for(let i=0;i<20&&root.querySelector('#roomButton')?.disabled;i++)await settle();
 click('[data-tab=settings]');
 root.querySelector('[data-set=enabled]').checked=true;
 root.querySelector('[data-set=automatic]').checked=false;
 root.querySelector('#budgetTokens').value='4500';
 root.querySelector('#interval').value='2';
 root.querySelector('#connection option[value=conn1]').selected=true;
 click('[data-act=settings]');await settle();await settle();
 const d=bag['integrated-memory-v1:room1'];assert(d.settings.enabled);assert.equal(d.settings.automatic,false);assert.equal(d.settings.budgetTokens,4500);assert.equal(d.settings.interval,2);assert.equal(d.settings.connectionId,'conn1');
 bag['integrated-memory-v1:room1'].records=[{id:'r1',kind:'quote',text:'기억 설명',sourceIds:['u1'],origin:'messages'}];
 click('[data-tab=start]');click('[data-act=refresh]');await settle();await settle();
 click('[data-tab=records]');click('[data-act=source]');await settle();await settle();
 assert(root.querySelector('#records pre').textContent.includes('손바닥에 글을 썼다.'));
 click('[data-act=backRecords]');assert(root.querySelector('article').textContent.includes('기억 설명'));

 ctx.prompt=()=> '병원의 밤';
 click('[data-tab=episodes]');click('[data-act=newEpisode]');await settle();await settle();
 click('[data-act=newEvent]');await settle();
 root.querySelector('#eventTitle').value='외출 조건 협의';
 root.querySelector('#eventText').value='서래가 외출을 요청하자 재헌은 식사 후 나가자는 조건을 제시했고, 서래가 동의했다.';
 root.querySelector('#eventSources').value='u1';
 root.querySelector('[data-detail=who]').value='서래와 재헌';
 root.querySelector('[data-detail=what]').value='식사 후 외출하기로 했다';
 click('[data-act=quoteAdd]');await settle();
 root.querySelector('[data-q=speaker]').value='서래';
 root.querySelector('[data-q=quote]').value='기사님 불러';
 root.querySelector('[data-q=channel] option[value=written]').selected=true;
 click('[data-act=quoteAdd]');await settle();
 const quoteRows=root.querySelectorAll('[data-quote-row]');assert.equal(quoteRows.length,2);
 quoteRows[1].querySelector('[data-q=speaker]').value='재헌';
 quoteRows[1].querySelector('[data-q=quote]').value='알았어';
 click('[data-act=eventSave]');await settle();await settle();
 let saved=bag['integrated-memory-v1:room1'];const event=saved.records.find(r=>r.kind==='event');assert(event);assert(event.text.includes('식사 후 나가자는 조건'));assert.equal(event.title,'외출 조건 협의');assert.equal(root.querySelectorAll('.event-body > .fact-grid').length,0);assert.equal(event.details.what,'식사 후 외출하기로 했다');assert.equal(saved.records.filter(r=>r.eventId===event.id&&!r.deleted).length,2);
 assert(root.querySelector('#content').textContent.includes('사건 1개'));
 click('[data-act=newEvent]');await settle();root.querySelector('[data-detail=what]').value='통신비 납부';click('[data-act=eventSave]');await settle();await settle();
 saved=bag['integrated-memory-v1:room1'];assert.equal(saved.records.filter(r=>r.kind==='event').length,2);
 assert(root.querySelector('#content').textContent.includes('사건 2개'));
 click('.event-body [data-act=source]');await settle();await settle();
 assert.equal(root.querySelector('#content h1').textContent,'근거 원문');
 assert(root.querySelector('#sourceOriginal').textContent.includes('손바닥에 글을 썼다.'));
 click('[data-act=backRecords]');assert.equal(root.querySelector('#content h1').textContent,'챕터');
 assert(root.querySelector('#content').textContent.includes('사건 2개'));

 // New profile/selection UI uses real DOM and actual event handlers.
 bag['integrated-memory-v1:room1'].records=[{id:'p',kind:'fact',subject:'서재헌',section:'role',people:['서재헌, 한서래'],text:'서재헌은 배우다.',time:'2027-01-01 00:00',sourceIds:['u1']},...Array.from({length:204},(_,i)=>({id:'bulk'+i,kind:'event',text:'기억 '+i,people:['재헌'],sourceIds:[]}))];
 click('[data-act=refresh]');await settle();await settle();click('[data-tab=people]');
 assert(![...root.querySelectorAll('.person-chips button')].some(n=>n.textContent.includes('서재헌, 한서래')));
 click('[data-act=selectPerson][data-record="서재헌"]');await settle();
 assert(root.querySelector('.person-profile').textContent.includes('직업·직책'));
 root.querySelector('#personAliases').value='재헌';click('[data-act=saveIdentity]');await settle();await settle();
 assert.equal(C.canonicalName(bag['integrated-memory-v1:room1'],'재헌'),'서재헌');
 assert(![...root.querySelectorAll('.person-chips button')].some(n=>n.dataset.record==='재헌'));
 click('[data-tab=timeline]');assert(root.querySelector('.timeline-stamp').textContent.includes('작중 시점'));assert(root.querySelector('.timeline-stamp').textContent.includes('2027-01-01 00:00'));assert(!root.querySelector('#content').textContent.includes('실제 메시지 작성 시각'));
 click('[data-tab=records]');assert.equal(root.querySelectorAll('[data-memory-id]').length,160);assert.equal(root.querySelector('[data-memory-id]').getAttribute('role'),'switch');
 click('[data-act=selectAllMemories]');await settle();assert(root.querySelector('.selection-toolbar').textContent.includes('선택 205개'));
 click('[data-act=deleteSelectedMemories]');await settle();await settle();assert.equal(bag['integrated-memory-v1:room1'].records.filter(r=>!r.deleted).length,0);
 // Full chapter visibility and saved-memory priority controls.
 const indexState=C.empty();indexState.episodes=Array.from({length:33},(_,i)=>({id:'index'+i,title:'기록 '+(i+1)+' · 오래된 약속을 확인하고 다음 장면으로 이어지는 이야기',summary:'챕터 내용',messageRange:{from:i?i*13+1:1,to:(i+1)*13,count:13}}));indexState.currentEpisodeId='index32';indexState.records=indexState.episodes.map((ep,i)=>({id:'index-event'+i,kind:'event',episodeId:ep.id,title:ep.title,text:'사건의 상세 내용 '+i,details:{who:'서래',what:'메모 전달',how:'협탁에 두었다',when:i?'2027-01-06 21:00':'2027-01-01 09:00'},time:i?'2027-01-06 21:00':'2027-01-01 09:00',sourceIds:[]}));
 bag['integrated-memory-v1:room1']=indexState;
 click('[data-act=refresh]');await settle();await settle();click('[data-tab=episodes]');
 assert.equal(root.querySelectorAll('.chapter-grid .file-index').length,33);
 assert(root.querySelector('.chapter-grid .file-index').textContent.includes('CHAPTER 01'));
 assert(root.querySelector('.chapter-grid .file-index').textContent.includes('2027-01-01'));
 click('.chapter-grid [data-record="index0"]');await settle();
 assert(root.querySelector('#chapterDetail').textContent.includes('2027-01-01'));
 assert.equal(root.querySelector('.event-narrative p').textContent,'사건의 상세 내용 0');
 assert(root.querySelector('.event-body [data-act=source]'));
 assert.equal(bag['integrated-memory-v1:room1'].episodes.length,33);
 click('[data-tab=records]');
 assert(root.querySelector('.intro').textContent.includes('개별 채택 없이'));
 const record=root.querySelector('[data-memory-card="index-event32"]');
 assert(!record.querySelector('.memory-details').hasAttribute('open'));
 assert(record.querySelector('.memory-card-top').textContent.includes('사건'));
 assert.equal(record.querySelector('[data-act=pin]').textContent,'우선 참고로 지정');
 click('[data-memory-card="index-event32"] [data-act=pin]');await settle();await settle();
 assert.equal(bag['integrated-memory-v1:room1'].records.find(r=>r.id==='index-event32').pinned,true);
 assert.equal(root.querySelector('[data-memory-card="index-event32"] [data-act=pin]').textContent,'우선 참고 해제');
 click('[data-memory-card="index-event32"] [data-act=pin]');await settle();await settle();
 assert.equal(bag['integrated-memory-v1:room1'].records.find(r=>r.id==='index-event32').pinned,false);
 // Existing slash/short-name records regroup without re-extraction.
 bag['integrated-memory-v1:room1'].records=[{id:'names1',kind:'event',text:'일정 전달',people:['서재헌/한서래','서재헌의 매니저'],sourceIds:['a']},{id:'names2',kind:'event',text:'일정 변경',people:['서래','서재헌의 매니저'],sourceIds:['b']}];
 click('[data-act=refresh]');await settle();await settle();click('[data-tab=people]');
 const chips=[...root.querySelectorAll('.person-chips button')].map(n=>n.dataset.record);
 assert.deepEqual(chips,['서재헌','서재헌의 매니저','한서래']);
 click('[data-act=selectPerson][data-record="한서래"]');await settle();
 assert.equal(root.querySelector('#personAliases').value,'서래');
 assert(root.querySelector('.person-profile').textContent.includes('관련 사건 2개'));
 click('[data-act=selectPerson][data-record="서재헌의 매니저"]');await settle();
 assert(root.querySelector('.person-profile').textContent.includes('같은 직책의 여러 사람'));
 bag['integrated-memory-v1:room1'].episodes=[{id:'empty-chapter',title:'빈 인용 검사',sourceIds:['a']}];bag['integrated-memory-v1:room1'].currentEpisodeId='empty-chapter';bag['integrated-memory-v1:room1'].records=[{id:'empty-event',kind:'event',text:'협의',episodeId:'empty-chapter',sourceIds:['a']},{id:'empty-quote',kind:'quote',text:'본문 누락',episodeId:'empty-chapter',eventId:'empty-event',sourceIds:['a']}];
 click('[data-act=refresh]');await settle();await settle();click('[data-tab=episodes]');
 assert(root.querySelector('[data-act=enrichQuotes]'));assert(root.querySelector('[data-act=enrichDetails]'));assert(root.querySelector('#content').textContent.includes('인용 본문이 없는 기존 기록 1개'));
 assert.equal(root.querySelectorAll('.quote-card').length,0);assert(root.querySelector('.event-row summary').textContent.includes('발언 0'));
 bag['integrated-memory-v1:room1'].records.push({id:'context-quote',kind:'quote',quote:'그건 싫어.',text:'검사 동행 거절',speaker:'한서래',recipient:'서재헌',episodeId:'empty-chapter',eventId:'empty-event',quoteContext:{before:'검사 동행을 제안받았다.',meaning:'동행 제안을 거절했다.',after:'상대가 제안을 거두었다.'},quoteLinkReason:'검사 동행 문답',sourceIds:['a']});
 click('[data-act=refresh]');await settle();await settle();click('[data-tab=episodes]');
 const card=root.querySelector('.quote-card');assert(card.textContent.includes('발언 전 상황'));assert(card.textContent.includes('검사 동행을 제안받았다.'));assert(card.textContent.includes('상대가 제안을 거두었다.'));assert(card.textContent.includes('사건 연결 근거: 검사 동행 문답'));
 const storedEvent=bag['integrated-memory-v1:room1'].records.find(r=>r.id==='empty-event');storedEvent.contextQuotes=[{kind:'quote',contextQuote:true,quote:'이전에 확인한 질문',speaker:'한서래',recipient:'서재헌',channel:'spoken',quoteVerified:true,sourceIds:['u1'],sourcePositions:{u1:1}}];click('[data-act=refresh]');await settle();await settle();click('[data-tab=episodes]');assert(root.querySelector('.event-body').textContent.includes('과거 발언 참고'));assert(root.querySelector('.event-body').textContent.includes('이전에 확인한 질문'));click('.event-body [data-act=source]');await settle();await settle();assert(root.querySelector('#sourceOriginal').textContent.includes('손바닥에 글을 썼다.'));click('[data-act=backRecords]');
 bag['integrated-memory-v1:room1'].records=[{id:'past-memory',kind:'event',title:'복귀 후 재장착 약속',text:'돌아오면 피어싱을 끼워주기로 약속했다.',episodeId:'empty-chapter',sourceIds:['u1']},{id:'later-memory',kind:'event',title:'약속 이행 요청',text:'약속을 기억하고 입을 벌렸다.',episodeId:'empty-chapter',sourceIds:['u1'],memoryLinks:[{recordId:'past-memory',reason:'복귀 후 재장착 약속을 이행해 달라는 요청'}]}];click('[data-act=refresh]');await settle();await settle();click('[data-tab=episodes]');assert(root.querySelector('[data-record="past-memory"][data-act=openLinkedMemory]'));assert(root.querySelector('#content').textContent.includes('이 기억을 참조한 후속 기억'));click('[data-record="past-memory"][data-act=openLinkedMemory]');await settle();await settle();assert.equal(root.querySelector('#content h1').textContent,'연결된 기억');assert(root.querySelector('.memory-details').hasAttribute('open'));assert(root.querySelector('.memory-full').textContent.includes('돌아오면 피어싱'));click('[data-record="later-memory"][data-act=openLinkedMemory]');await settle();await settle();assert(root.querySelector('.memory-details h3').textContent.includes('약속 이행 요청'));assert(root.querySelector('.memory-full').textContent.includes('약속을 기억하고 입을 벌렸다.'));click('[data-act=backLinkedMemory]');await settle();await settle();assert(root.querySelector('.memory-full').textContent.includes('돌아오면 피어싱'));click('[data-act=backLinkedMemory]');await settle();await settle();assert.equal(root.querySelector('#content h1').textContent,'챕터');
 const diag={version:'test',chatId:'room1',stage:'원문 대조',responseText:'<script>example</script>\n원문',validationError:'검사 오류'};ctx.setTestDiagnostic(diag);click('[data-tab=collection]');assert(root.querySelector('[data-act=modelDiagnosticCopy]'));let copiedJson;
 ctx.navigator={clipboard:{writeText:async value=>{copiedJson=value;}}};click('[data-act=modelDiagnosticCopy]');await settle();await settle();assert.deepEqual(JSON.parse(copiedJson),diag);assert(root.querySelector('#status').textContent.includes('복사했습니다'));
 ctx.navigator.clipboard.writeText=async()=>{throw Error('blocked');};click('[data-act=modelDiagnosticCopy]');await settle();await settle();const jsonArea=root.querySelector('#diagnosticCopyText');assert(jsonArea);assert(jsonArea.hasAttribute('readonly'));assert.deepEqual(JSON.parse(jsonArea.value),diag);assert.equal(root.querySelectorAll('#content script').length,0);assert(root.querySelector('#status').textContent.includes('펼쳤습니다'));
 // Full narrative and exact values are visible in the chronology; verified same-event groups preserve cards and quotes.
 bag['integrated-memory-v1:room1'].records=[{id:'graduation-question',kind:'event',episodeId:'empty-chapter',title:'졸업식 전 퇴원 질문',text:'한서래는 2월 둘째 주까지 퇴원 가능한지 물었다.',time:'27-01-03 08:57',sourceIds:[]},{id:'graduation-answer',kind:'event',episodeId:'empty-chapter',title:'졸업식 시기 확인',text:'서재헌은 앞선 질문으로 졸업식 시기가 드러났다고 답했다.',time:'2027-01-03 08:58',sourceIds:[],memoryLinks:[{recordId:'graduation-question',reason:'퇴원 질문과 이어진 답변',relation:'same_event'}]},{id:'graduation-quote',kind:'quote',eventId:'graduation-answer',episodeId:'empty-chapter',speaker:'서재헌',quote:'2월 둘째 주잖아.',text:'퇴원 질문에 대한 답변',time:'27-01-03 08:58',sourceIds:[]},{id:'password',kind:'event',title:'가방 잠금번호 확인',text:'원문에 적힌 가상의 가방 번호 2468을 확인했다.',time:'27-01-03 08:30',sourceIds:[]}];
 click('[data-act=refresh]');await settle();await settle();click('[data-tab=timeline]');
 assert(root.querySelector('#content').textContent.includes('가방 번호 2468'));assert(root.querySelector('#content').textContent.includes('2월 둘째 주까지 퇴원'));assert(root.querySelector('[data-act=openLinkedMemory]'));assert.equal(root.querySelectorAll('.timeline-card').length,3);assert.equal(root.querySelectorAll('.timeline-card blockquote').length,1);assert(root.querySelector('.timeline-card').textContent.includes('가방 번호 2468'));
 click('[data-tab=records]');assert(root.querySelector('.continuous-events'));assert.equal(root.querySelectorAll('[data-memory-card="graduation-quote"]').length,0);assert(root.querySelector('[data-memory-card="graduation-answer"] .quote-card').textContent.includes('2월 둘째 주잖아.'));assert(root.querySelector('.memory-link-badge'));assert(root.querySelector('[data-act=enrichContinuity]'));
 click('[data-tab=episodes]');assert(root.querySelector('.continuous-events'));assert(root.querySelector('[data-act=enrichContinuity]'));
 historyRows=[{id:'turn-user',role:'user',name:'한서래',rowid:1,content:'"……거짓말. 콜록, 아, 입 비려."'},{id:'turn-reply',role:'assistant',name:'서재헌',rowid:2,content:'서재헌이 앞서 한 말을 설명했다.'},{id:'next-user',role:'user',rowid:3,content:'다음 대화'}];
 bag['integrated-memory-v1:room1'].records=[{id:'turn-player-event',kind:'event',episodeId:'empty-chapter',text:'한서래가 앞선 말을 반박하고 입안의 비린 맛을 호소했다.',time:'',sourceIds:['turn-user']},{id:'turn-character-event',kind:'event',episodeId:'empty-chapter',text:'서재헌이 반박에 답하며 앞서 한 말을 설명했다.',time:'27-01-02 21:52',sourceIds:['turn-reply']}];
 click('[data-act=refresh]');await settle();await settle();click('[data-tab=records]');assert(root.querySelector('[data-turn-group="turn_turn-user"]'));assert(root.querySelector('.continuous-events summary').textContent.includes('같은 턴'));assert.equal(root.querySelectorAll('.continuous-events .memory-card').length,2);
 click('[data-tab=episodes]');assert.equal(root.querySelectorAll('[data-turn-group="turn_turn-user"] .event-row').length,2);
 click('[data-tab=timeline]');assert.equal(root.querySelectorAll('[data-turn-group="turn_turn-user"] .timeline-card').length,2);assert(root.querySelector('[data-turn-group="turn_turn-user"]').textContent.includes('작중 시점 미상'));
 cleanup();assert.equal(document.querySelector('#integrated-memory-extension'),null);
});

test('v0104 real DOM chapter facts, source order and semantic chapter hyperlinks',async()=>{
 const {document,window}=parseHTML('<html><body></body></html>'),d=C.empty();d.episodes=[{id:'p',title:'앞선 약속',messageRange:{from:1,to:9}},{id:'e',title:'약속 이행',messageRange:{from:10,to:20}}];d.records=[{id:'old',kind:'event',text:'앞선 약속',episodeId:'p',order:300},{id:'later',kind:'event',title:'나중 사건',text:'나중',episodeId:'e',order:329,sourcePositions:{b:12}},{id:'earlier',kind:'event',title:'먼저 사건',text:'먼저',episodeId:'e',order:325,sourcePositions:{a:10},memoryLinks:[{recordId:'old',reason:'약속을 이행함',relation:'followup'}]},{id:'fact',kind:'fact',section:'chapter_detail',text:'원서 접수 마감은 1월 7일이다.',episodeId:'e'}];
 const ctx={console,setTimeout,clearTimeout,Request,Response,Headers,AbortController,URL,Blob,crypto,document,location:{href:'http://marinara.test/',origin:'http://marinara.test'},localStorage:{getItem:()=>null},fetch:async()=>Response.json([]),marinara:{storage:{get:async()=>({}),patch:async()=>({})},onCleanup:fn=>ctx.cleanup=fn}};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'core.cjs'),'utf8'),ctx);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'runtime.js'),'utf8').replace('host.onCleanup?.(cleanup);',"globalThis.fixture=d=>{state=C.normalize(d);active='room1';selectedEpisode='e';tab='episodes';open=true;render();};host.onCleanup?.(cleanup);"),ctx);if(!document.querySelector('#integrated-memory-extension'))document.dispatchEvent(new window.Event('DOMContentLoaded'));ctx.fixture(d);const root=document.querySelector('#integrated-memory-extension').shadowRoot;assert(root.querySelector('#content').textContent.includes('원서 접수 마감은 1월 7일이다.'));const rows=[...root.querySelectorAll('.event-no')].map(n=>n.textContent);assert.deepEqual(rows,['325','329']);const a=root.querySelector('.chapter-details a[data-act=openChapter][data-record=p]');assert(a);a.dispatchEvent(new window.Event('click',{bubbles:true}));await new Promise(r=>setImmediate(r));assert(root.querySelector('#chapterDetail').textContent.includes('앞선 약속'));ctx.cleanup();
});

test('v0107 real DOM consolidated event shows one narrative with recoverable originals and complete dialogue',async()=>{
 const {document,window}=parseHTML('<html><body></body></html>'),d=C.empty();d.episodes=[{id:'e',title:'짐 회수',sourceIds:['u','a'],messageRange:{from:1,to:2}}];d.records=[{id:'one',kind:'event',title:'짐 회수 협의',text:'한서래가 보관함 번호와 추가 요금을 알리고 서재헌이 기사를 보내겠다고 답했다.',episodeId:'e',sourceIds:['u','a'],order:42,narrativeConsolidated:true,details:{how:'반복되는 옛 설명'},eventConsolidationHistory:[{id:'one',title:'이전 요청',text:'원래 요청 내용'},{id:'two',title:'이전 응답',text:'원래 응답 내용'}]},{id:'quote',kind:'quote',text:'한서래가 짐 위치와 요금을 말했다.',quote:'보관함은 42, 43, 44번이야. 추가 요금은 4천 원이야.',speaker:'한서래',channel:'spoken',quoteVerified:true,eventId:'one',episodeId:'e'}];
 const ctx={console,setTimeout,clearTimeout,Request,Response,Headers,AbortController,URL,Blob,crypto,document,location:{href:'http://marinara.test/',origin:'http://marinara.test'},localStorage:{getItem:()=>null},fetch:async()=>Response.json([]),marinara:{storage:{get:async()=>({}),patch:async()=>({})},onCleanup:fn=>ctx.cleanup=fn}};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'core.cjs'),'utf8'),ctx);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'runtime.js'),'utf8').replace('host.onCleanup?.(cleanup);',"globalThis.fixture=d=>{state=C.normalize(d);active='room1';selectedEpisode='e';tab='episodes';open=true;render();};host.onCleanup?.(cleanup);"),ctx);if(!document.querySelector('#integrated-memory-extension'))document.dispatchEvent(new window.Event('DOMContentLoaded'));ctx.fixture(d);const root=document.querySelector('#integrated-memory-extension').shadowRoot;assert.equal(root.querySelectorAll('.event-row').length,1);assert(root.querySelector('.event-narrative').textContent.includes('통합 전 기록 2개 확인'));assert(!root.querySelector('.event-narrative').textContent.includes('반복되는 옛 설명'));assert(root.querySelector('.quote-card').textContent.includes('42, 43, 44번이야. 추가 요금은 4천 원이야.'));assert(root.querySelector('[data-act=chapterDetails][data-record=one]'));ctx.cleanup();
});

test('v01018 DOM exposes local error copy and download above every tab with safe clipboard fallback',async()=>{
 const {document,window}=parseHTML('<!DOCTYPE html><html><body></body></html>'),bag={'integrated-memory-v1:room1':C.empty()};let cleanup;
 const ctx={console,setTimeout,clearTimeout,Request,Response,Headers,AbortController,URL,Blob,crypto,document,location:{href:'http://marinara.test/',origin:'http://marinara.test'},localStorage:{getItem:()=> 'room1'},confirm:()=>true,prompt:()=>null,fetch:async input=>{const p=String(input);return p.endsWith('/api/chats/room1')?Response.json({id:'room1',name:'첫 방'}):p.endsWith('/message-count')?Response.json({count:0}):Response.json([]);},marinara:{storage:{get:async()=>structuredClone(bag),patch:async data=>{Object.assign(bag,structuredClone(data));return {ok:true};}},onCleanup:fn=>cleanup=fn}};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'core.cjs'),'utf8'),ctx);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'runtime.js'),'utf8').replace('host.onCleanup?.(cleanup);','globalThis.failLocalTest=()=>action(async()=>{throw Error("로컬 오류 <script>unsafe</script>");});globalThis.getLocalDiagnostic=()=>lastExtractionDiagnostic;host.onCleanup?.(cleanup);'),ctx);if(!document.querySelector('#integrated-memory-extension'))document.dispatchEvent(new window.Event('DOMContentLoaded'));const root=document.querySelector('#integrated-memory-extension').shadowRoot,settle=()=>new Promise(resolve=>setImmediate(resolve)),click=s=>root.querySelector(s).dispatchEvent(new window.Event('click',{bubbles:true}));root.querySelector('#launch').onclick();for(let i=0;i<20;i++)await settle();assert(root.querySelector('#errorActions').hidden);await ctx.failLocalTest();assert.equal(root.querySelector('#error').hidden,false);assert.equal(root.querySelector('#errorActions').hidden,false);assert(root.querySelector('#errorActions [data-act=modelDiagnosticCopy]'));assert(root.querySelector('#errorActions [data-act=modelDiagnostic]'));assert.equal(root.querySelectorAll('script').length,0);const saved=JSON.stringify(bag);ctx.navigator={clipboard:{writeText:async()=>{throw Error('blocked');}}};click('#errorActions [data-act=modelDiagnosticCopy]');await settle();await settle();let area=root.querySelector('#diagnosticCopyText');assert(area);assert(area.hasAttribute('readonly'));assert.deepEqual(JSON.parse(area.value),JSON.parse(JSON.stringify(ctx.getLocalDiagnostic())));assert.equal(root.querySelectorAll('script').length,0);click('[data-tab=collection]');assert.equal(root.querySelectorAll('#diagnosticCopyText').length,1);assert(root.querySelector('#content #diagnosticCopyText'));click('[data-tab=records]');assert.equal(root.querySelectorAll('#diagnosticCopyText').length,1);assert(root.querySelector('#errorActions #diagnosticCopyText'));assert.equal(JSON.stringify(bag),saved);cleanup();
});
