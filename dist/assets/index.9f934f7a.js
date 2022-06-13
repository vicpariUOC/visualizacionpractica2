import{S as N,C as S,F,a as E,V as I,G as O,b as B,T,O as L,c as x,M as k,d as j,e as U,f as G}from"./vendor.bad25f21.js";const H=function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))a(t);new MutationObserver(t=>{for(const o of t)if(o.type==="childList")for(const d of o.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&a(d)}).observe(document,{childList:!0,subtree:!0});function s(t){const o={};return t.integrity&&(o.integrity=t.integrity),t.referrerpolicy&&(o.referrerPolicy=t.referrerpolicy),t.crossorigin==="use-credentials"?o.credentials="include":t.crossorigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(t){if(t.ep)return;t.ep=!0;const o=s(t);fetch(t.href,o)}};H();const V=["Afghanistan to Iran","Belarus-EU border","Caribbean to US","Central Mediterranean","Central Mediterranean,US-Mexico border crossing","Comoros to Mayotte","Darien Gap","Dominican Republic to Puerto Rico","DRC to Uganda","Eastern Mediterranean","English Channel to the UK","Haiti to Dominican Republic","Horn of Africa to Yemen crossing","Iran to Turkey","Italy to France","Sahara Desert crossing","Syria to Turkey","Turkey-Europe land route","Ukraine to Europe","US-Mexico border crossing","Venezuela to Caribbean","Western Africa / Atlantic route to the Canary Islands","Western Balkans","Western Mediterranean"],D=["#3982D0","#D96D73","#5A59A6","#6DB6A1","#F78B41","#5DB9E0","#418A8B","#A2578D","#E5B75D","#234E63","#90B9E5","#A74460","#A2A2CD","#50826F","#FABD94","#3B98AB","#8AC7C8","#6D466B"],w=[];for(let e=0;e<D.length;e++)w.push(new N({image:new S({radius:10,fill:new F({color:D[e]}),stroke:new E({color:"#666666",width:1})})}));function W(e,r,s){const a=r.indexOf(e)||0;return s[a%s.length]}var l,m;function z(){var e="https://missingmigrants.iom.int/sites/g/files/tmzbdl601/files/report-migrant-incident/Missing_Migrants_Global_Figures_allData.csv";$.ajax({type:"GET",url:e,dataType:"text",success:function(r){l=$.csv.toObjects(r),P(l)}})}function M(){if(!l)z();else{const e=$("#fieldMigrationRoute").find(":selected").val(),r=$("#fieldRegionOrigin").find(":selected").val(),s=$("#fieldDeathCause").find(":selected").val(),a=$("#fieldIncidentRegion").find(":selected").val();m=new Array;for(let t=0;t<l.length;++t){let o=!0;(e&&l[t]["Migration route"]!==e||r&&l[t]["Region of Origin"]!==r||s&&l[t]["Cause of Death"]!==s||a&&l[t]["Region of Incident"]!==a)&&(o=!1),o&&m.push(l[t])}P(m)}}$("#searchButton").click(function(){M()});const C="EPSG:3857";var u,p,y;function P(e){let r={type:"FeatureCollection",crs:{type:"name",properties:{name:C}},features:[]};new Array;let s=0,a=0,t=0;const o=e.length;for(let n=0;n<e.length&&n<o;++n){const c=e[n].Coordinates;if(c){const f=c.substring("POINT(".length+1,c.length-1).split(" "),h=f[0]*1e5,g=f[1]*1e5;r.features.push({type:"Feature",geometry:{type:"Point",coordinates:[h,g]},properties:{originRegion:e[n]["Region of Origin"],incidentRegion:e[n]["Region of Incident"],year:e[n]["Incident year"],month:e[n]["Reported Month"],numDeathMissing:e[n]["Total Number of Dead and Missing"],numSurvivors:e[n]["Number of Survivors"],migrationRoute:e[n]["Migration route"],deathLocation:e[n]["Location of death"],articleTitle:e[n]["Article title"],mainId:e[n]["Main ID"],numDeathFemales:e[n]["Number of Females"],numDeathMales:e[n]["Number of Males"],numDeathChildren:e[n]["Number of Children"],deathCause:e[n]["Cause of Death"]}})}s+=Number(e[n]["Total Number of Dead and Missing"])||0,a+=Number(e[n]["Number of Females"])||0,t+=Number(e[n]["Number of Children"])||0}console.log(r),y=new I({features:new O().readFeatures(r)});const d=function(n){return W(n.getProperties().migrationRoute,V,w)};p?(p.setSource(y),p.getSource().changed()):p=new B({source:y,style:d});const b=[new T({source:new L}),p],R=new x({layers:b});if(!u){u=new k({layers:b,target:document.getElementById("map"),view:new j({center:[40,0],zoom:1,projection:C}),controls:U().extend([R])});const n=document.getElementById("popup"),c=document.getElementById("popup-content"),f=document.getElementById("table-content"),h=document.getElementById("popup-closer"),g=new G({element:n,positioning:"bottom-center",stopEvent:!1,autoPan:{animation:{duration:250}}});u.addOverlay(g),h.onclick=function(){return g.setPosition(void 0),c.innerHTML="",f.innerHTML="",h.blur(),!1},u.on("click",function(v){const i=u.forEachFeatureAtPixel(v.pixel,function(A){return A});i&&(g.setPosition(v.coordinate),c.innerHTML=`<div class="row justify-content-center">
<div class="col-auto">
<table class="table table-responsive">
  <tbody>
    <tr>
      <th scope="row">Dead and missing</th>
      <td>`+i.getProperties().numDeathMissing||`N/A</td>
      <th scope="row">Survivors</th>
      <td>`+i.getProperties().numSurvivors||`N/A</td>
    </tr>
    <tr>
      <th scope="row">Females dead</th>
      <td>`+i.getProperties().numDeathFemales||`N/A</td>
      <th scope="row">Childrens dead</th>
      <td>`+i.getProperties().numDeathChildren||`N/A</td>
    </tr>
  </tbody>
</table><a href="#table-content" class="link-info">More info</a></div></div>`,f.innerHTML=`<table class="table">
  <tbody>
    <tr>
      <th scope="row">Region of Origin</th>
      <td>`+i.getProperties().originRegion+`</td>
      <th scope="row">Region of Incident</th>
      <td>`+i.getProperties().incidentRegion+`</td>
    </tr>
    <tr>
      <th scope="row">Incident year</th>
      <td>`+i.getProperties().year+`</td>
      <th scope="row">Reported Month</th>
      <td>`+i.getProperties().month+`</td>
    </tr>
    <tr>
      <th scope="row">Total Number of Dead and Missing</th>
      <td>`+i.getProperties().numDeathMissing+`</td>
      <th scope="row">Number of Survivors</th>
      <td>`+i.getProperties().numSurvivors+`</td>
    </tr>
    <tr>
      <th scope="row">Number of Females Death</th>
      <td>`+i.getProperties().numDeathFemales+`</td>
      <th scope="row">Number of Children Death</th>
      <td>`+i.getProperties().numDeathChildren+`</td>
    </tr>
    <tr>
      <th scope="row">Migration route</th>
      <td>`+i.getProperties().migrationRoute+`</td>
      <th scope="row">Location of death</th>
      <td>`+i.getProperties().deathLocation+`</td>
    </tr>
    <tr>
      <th scope="row">Article title</th>
      <td>`+i.getProperties().articleTitle+`</td>
    </tr>
  </tbody>
</table>`)})}_(s,a,t),u.updateSize()}function _(e,r,s){$("#totalDeathMissing").text(e),$("#totalWomen").text(r),$("#totalChildren").text(s)}M();
//# sourceMappingURL=index.9f934f7a.js.map
