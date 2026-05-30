export default async function handler(req,res){
  if(req.method!=='POST'){
    res.statusCode=405;
    return res.end(JSON.stringify({error:'POST requis'}));
  }
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
    const question=body.question||'';
    const context=body.context||{};
    const key=process.env.OPENAI_API_KEY;
    if(!key){
      res.setHeader('content-type','application/json; charset=utf-8');
      return res.end(JSON.stringify({mode:'local',answer:`Mode local sans OPENAI_API_KEY. Décision actuelle: ${context.decision||'ATTENDRE'}. Le système protège le capital: risque 1%, stop loss obligatoire, ratio minimum 2:1, et aucune exécution réelle. Question reçue: ${question}`}));
    }
    const upstream=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${key}`},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',instructions:'Tu es un mentor de trading éducatif. Pas de conseil financier, pas de promesse de profit, pas d’ordre de trading réel.',input:`Question: ${question}\nContexte: ${JSON.stringify(context)}`})});
    const data=await upstream.json();
    const answer=data.output_text||'Réponse IA vide.';
    res.setHeader('content-type','application/json; charset=utf-8');
    return res.end(JSON.stringify({mode:'openai',answer}));
  }catch(e){
    res.statusCode=500;
    res.setHeader('content-type','application/json; charset=utf-8');
    return res.end(JSON.stringify({error:e.message||'Erreur agent IA'}));
  }
}
