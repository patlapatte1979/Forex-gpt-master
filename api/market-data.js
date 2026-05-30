export default function handler(req,res){
  const url=new URL(req.url||'/','https://local.app');
  const pair=url.searchParams.get('pair')||'EUR/USD';
  const years=Math.min(+(url.searchParams.get('years')||5),20);
  const rand=(()=>{let s=0;for(let i=0;i<pair.length;i++)s=(s*31+pair.charCodeAt(i))>>>0;return()=>{s=(1664525*s+1013904223)>>>0;return s/4294967296}})();
  let price=pair.includes('JPY')?145:pair.includes('GBP')?1.26:pair.includes('CAD')?1.36:1.08;
  const candles=[];
  const days=Math.round(years*365.25);
  const start=Date.now()-days*86400000;
  for(let i=0;i<=days;i++){
    const d=new Date(start+i*86400000);
    if(d.getUTCDay()===0||d.getUTCDay()===6)continue;
    const open=price;
    const close=Math.max(.0001,open+(rand()-.5)*(pair.includes('JPY')?.65:.0065));
    const spread=Math.abs(close-open)+(pair.includes('JPY')?.18:.0022)*(0.5+rand());
    const high=Math.max(open,close)+spread*(.25+rand());
    const low=Math.min(open,close)-spread*(.25+rand());
    price=close;
    candles.push({time:d.toISOString().slice(0,10),open:+open.toFixed(pair.includes('JPY')?3:5),high:+high.toFixed(pair.includes('JPY')?3:5),low:+low.toFixed(pair.includes('JPY')?3:5),close:+close.toFixed(pair.includes('JPY')?3:5),volume:Math.round(900000+rand()*1400000)});
  }
  res.statusCode=200;
  res.setHeader('content-type','application/json; charset=utf-8');
  res.end(JSON.stringify({provider:'demo-local',mode:'demo',warning:'API marché réelle à brancher avec ALPHA_VANTAGE_API_KEY dans la prochaine étape.',pair,candles}));
}
