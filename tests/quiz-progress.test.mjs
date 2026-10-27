import{test}from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import{loadTs}from'./load-ts.mjs';
const data=JSON.parse(fs.readFileSync('lib/data/quiz.json','utf8'));
const questions=data.questions.map(q=>({...q,options:data.options.filter(o=>o.question_id===q.id)}));
const{shuffleQuizOptions,normalizeQuizScores}=loadTs('lib/quiz-questions.ts');
const{parseQuizProgress,serializeQuizProgress,quizProgressScores,quizProgressReducer}=loadTs('lib/quiz-progress.ts');
const plain=x=>JSON.parse(JSON.stringify(x));
const attempt={questions:shuffleQuizOptions(questions,()=>0),gender:'Female',answerIds:questions.slice(0,5).map(q=>q.options[1].id),ready:true};
test('any-gender preference survives recovery and backtracking',()=>{
 const any={...attempt,gender:'Any'};
 const restored=parseQuizProgress(serializeQuizProgress(any),questions);
 assert.equal(restored.gender,'Any');
 assert.equal(quizProgressReducer({...restored,answerIds:[]},{type:'back'}).gender,null);
 const {parseQuizResult}=loadTs('lib/quiz-session.ts');
 const scores=normalizeQuizScores(quizProgressScores(restored),restored.questions);
 assert.equal(parseQuizResult(JSON.stringify({version:1,slug:'francis-of-assisi',gender:'Any',scores})).gender,'Any');
});
test('mid-quiz recovery preserves answer identities and option order and recomputes scores',()=>{
 const saved=serializeQuizProgress(attempt),restored=parseQuizProgress(saved,questions);
 assert.deepEqual(plain(restored),plain(attempt));
 const expected=Object.fromEntries(['contemplative','charitable','intellectual','courageous','joyful','mystical'].map(k=>[k,questions.slice(0,5).reduce((n,q)=>n+q.options[1]['trait_'+k],0)]));
 assert.deepEqual(plain(quizProgressScores(restored)),expected);
 const injected=JSON.parse(saved);injected.scores={charitable:99999};
 assert.deepEqual(plain(quizProgressScores(parseQuizProgress(JSON.stringify(injected),questions))),expected);
});
test('Back after restoration removes exactly one score contribution and can return to gender',()=>{
 const restored=parseQuizProgress(serializeQuizProgress(attempt),questions);
 let rewound=quizProgressReducer(restored,{type:'back'});
 assert.deepEqual(plain(quizProgressScores(rewound)),plain(quizProgressScores({...attempt,answerIds:attempt.answerIds.slice(0,-1)})));
 for(let i=0;i<5;i++)rewound=quizProgressReducer(rewound,{type:'back'});
 assert.equal(rewound.gender,null);assert.equal(rewound.answerIds.length,0);
 assert.deepEqual(Object.values(quizProgressScores(rewound)),[0,0,0,0,0,0]);
});
test('malformed, completed and outdated attempts safely fail validation',()=>{
 const base=JSON.parse(serializeQuizProgress(attempt));
 const bad=[null,'','{broken','null','x'.repeat(32001),JSON.stringify({...base,version:2}),JSON.stringify({...base,gender:'invalid'}),JSON.stringify({...base,gender:null}),JSON.stringify({...base,answers:[questions[1].options[0].id]}),JSON.stringify({...base,answers:questions.map(q=>q.options[0].id)})];
 for(const edit of [v=>v.order.pop(),v=>v.order.reverse(),v=>v.order[0].options[0]='unknown',v=>v.order[0].options[0]=v.order[0].options[1],v=>v.order[0].question='outdated']){const v=structuredClone(base);edit(v);bad.push(JSON.stringify(v));}
 for(const raw of bad)assert.equal(parseQuizProgress(raw,questions),null);
});
test('restored answer sequences produce identical normalized profiles',()=>{
 for(let n=1;n<20;n++){const a={...attempt,answerIds:questions.slice(0,n).map((q,i)=>q.options[i%4].id)};
 const restored=parseQuizProgress(serializeQuizProgress(a),questions);
 assert.deepEqual(plain(normalizeQuizScores(quizProgressScores(restored),restored.questions)),plain(normalizeQuizScores(quizProgressScores(a),questions)));}
});
test('server-prepared quiz candidates preserve identities, displayed content and matching',()=>{
 const{getQuizCandidates}=loadTs('lib/quiz-candidates.ts');const{applySaintReview,canonicalSaintSlug}=loadTs('lib/saint-reviews.ts');const{rankSaints}=loadTs('lib/scoring.ts');
 const raw=JSON.parse(fs.readFileSync('lib/data/quiz-saints.json','utf8'));const old=raw.filter(s=>canonicalSaintSlug(s.slug)===s.slug).map(applySaintReview).filter(s=>s.kind==='saint');
 const next=getQuizCandidates();assert.deepEqual(Array.from(next,s=>s.slug),Array.from(old,s=>s.slug));
 for(const saint of next){const previous=old.find(s=>s.slug===saint.slug);for(const key of Object.keys(saint))assert.deepEqual(plain(saint[key]??null),plain(previous[key]??null),saint.slug+':'+key);}
 for(const gender of ['Male','Female'])for(let n=0;n<30;n++){const scores=Object.fromEntries(['contemplative','charitable','intellectual','courageous','joyful','mystical'].map((key,i)=>[key,(n*17+i*23)%101]));assert.deepEqual(Array.from(rankSaints(scores,next.filter(s=>s.gender===gender)),x=>x.saint.slug),Array.from(rankSaints(scores,old.filter(s=>s.gender===gender)),x=>x.saint.slug));}
 assert.ok(JSON.stringify(next).length<JSON.stringify(raw).length);
});

