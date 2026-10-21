export const executionLabels={ejecutada:'Práctica realizada en la herramienta',pendiente:'Práctica pendiente; solo preparación o revisión manual'};

export function canComplete(lesson,answer){
  if(lesson.pause)return true;
  return typeof answer.text==='string'&&answer.text.trim().length>=20
    &&(!lesson.ethics||(typeof answer.ethics==='string'&&answer.ethics.trim().length>=20))
    &&(!lesson.requiresExecution||answer.execution==='ejecutada')
    &&answer.checked===true&&answer.choice===lesson.quiz.answer;
}

export function normalizeAnswer(lesson,value={}){
  const a=value&&typeof value==='object'?value:{};
  const choice=Number.isInteger(a.choice)&&a.choice>=0&&a.choice<(lesson.quiz?.options.length||0)?a.choice:null;
  const result={text:typeof a.text==='string'?a.text:'',ethics:typeof a.ethics==='string'?a.ethics:'',execution:Object.hasOwn(executionLabels,a.execution)?a.execution:'',choice,checked:choice!==null&&a.checked===true,done:false};
  result.done=a.done===true&&canComplete(lesson,result);
  return result;
}

export function notebookMarkdown(course,answers,date){
  return `# ${course.title}\n\nCuaderno personal · ${date}\nEl estado es declarado por el participante; no certifica competencia ni valida resultados.\n\n`+course.lessons.filter(l=>!l.pause).map(l=>{
    const a=normalizeAnswer(l,answers[l.id]);
    return `## ${l.title}\n\n${l.task}\n\n${a.text||'(Sin respuesta registrada)'}\n\n`+(l.requiresExecution?`Práctica: ${executionLabels[a.execution]||'Sin registrar'}\n\n`:'')+(l.ethics?`### Decisión ética\n\n${l.ethics.question}\n\n${a.ethics||'(Decisión pendiente)'}\n\n`:'')+`Autoevaluación: ${a.checked?(a.choice===l.quiz.answer?'Respuesta correcta':'Necesita revisión'):'Sin comprobar'}\nEstado: ${a.done?'Completada por el participante':'En curso'}\n`;
  }).join('\n');
}
