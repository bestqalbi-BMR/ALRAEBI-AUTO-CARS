/* ALRAEBI V15 CLOUD SYNC */
(function(){
 const api=window.RACAPI;
 window.RACV15={
  async syncCars(){if(!api?.base)return false; try{const cars=await api.cars(); if(Array.isArray(cars)&&cars.length){localStorage.setItem('alraebi_cars_v10',JSON.stringify(cars.map(c=>({id:String(c.id),name:c.name,brand:c.brand,type:c.type,price:c.price,stock:c.status||c.stock,description:c.description||'',img:c.image||((c.images||[])[0]||'')})))); return true}}catch(e){} return false},
  async sendOrder(payload){if(!api?.base)return false; try{await api.request('/api/orders',{method:'POST',body:JSON.stringify(payload)});return true}catch(e){return false}},
  async sendLead(payload){if(!api?.base)return false; try{await api.request('/api/leads',{method:'POST',body:JSON.stringify(payload)});return true}catch(e){return false}}
 };
 document.addEventListener('DOMContentLoaded',()=>{if(api?.base)RACV15.syncCars()});
})();
