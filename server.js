const express=require("express"),path=require("path"),fs=require("fs"),crypto=require("crypto");
const Database=require("better-sqlite3"),bcrypt=require("bcryptjs"),jwt=require("jsonwebtoken");
const cors=require("cors"),helmet=require("helmet"),rateLimit=require("express-rate-limit"),multer=require("multer");
const app=express(),PORT=Number(process.env.PORT||3000),ROOT=path.resolve(__dirname,"..");
const DATA=path.join(__dirname,"data"),UPLOADS=path.join(__dirname,"uploads");
fs.mkdirSync(DATA,{recursive:true});fs.mkdirSync(UPLOADS,{recursive:true});
const JWT_SECRET=process.env.JWT_SECRET||"CHANGE_ME_V19_SECRET";
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||"";
const MAX_FILE=8*1024*1024;
const db=new Database(path.join(DATA,"alraebi.sqlite"));
db.pragma("journal_mode=WAL");db.pragma("foreign_keys=ON");
db.exec(`
CREATE TABLE IF NOT EXISTS admins(id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,role TEXT DEFAULT 'superadmin',created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS customers(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,phone TEXT UNIQUE NOT NULL,email TEXT,password_hash TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS cars(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,make TEXT,model TEXT,year INTEGER,price REAL DEFAULT 0,currency TEXT DEFAULT 'USD',type TEXT,fuel TEXT,transmission TEXT,mileage INTEGER DEFAULT 0,status TEXT DEFAULT 'available',quantity INTEGER DEFAULT 1,description TEXT,images_json TEXT DEFAULT '[]',featured INTEGER DEFAULT 0,created_at TEXT DEFAULT CURRENT_TIMESTAMP,updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY AUTOINCREMENT,customer_id INTEGER,customer_name TEXT NOT NULL,phone TEXT NOT NULL,car_id INTEGER,car_name TEXT,notes TEXT,status TEXT DEFAULT 'new',created_at TEXT DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS leads(id INTEGER PRIMARY KEY AUTOINCREMENT,customer_id INTEGER,name TEXT NOT NULL,phone TEXT NOT NULL,type TEXT DEFAULT 'inquiry',car_id INTEGER,car_name TEXT,notes TEXT,status TEXT DEFAULT 'new',created_at TEXT DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS settings(k TEXT PRIMARY KEY,v TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS audit_log(id INTEGER PRIMARY KEY AUTOINCREMENT,actor TEXT,action TEXT,entity TEXT,entity_id INTEGER,meta TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP);CREATE TABLE IF NOT EXISTS offers(id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,description TEXT,discount REAL DEFAULT 0,car_id INTEGER,start_at TEXT,end_at TEXT,active INTEGER DEFAULT 1,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS coupons(id INTEGER PRIMARY KEY AUTOINCREMENT,code TEXT UNIQUE NOT NULL,discount REAL DEFAULT 0,kind TEXT DEFAULT 'percent',max_uses INTEGER DEFAULT 0,uses INTEGER DEFAULT 0,active INTEGER DEFAULT 1,expires_at TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS appointments(id INTEGER PRIMARY KEY AUTOINCREMENT,customer_id INTEGER,name TEXT NOT NULL,phone TEXT NOT NULL,car_id INTEGER,car_name TEXT,date TEXT NOT NULL,time TEXT NOT NULL,notes TEXT,status TEXT DEFAULT 'new',created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS notifications(id INTEGER PRIMARY KEY AUTOINCREMENT,customer_id INTEGER,title TEXT NOT NULL,body TEXT,read_at TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
`);
try{db.exec("ALTER TABLE cars ADD COLUMN featured INTEGER DEFAULT 0")}catch{}
const seedSettings=db.prepare("SELECT COUNT(*) n FROM settings").get().n;if(!seedSettings){const ins=db.prepare("INSERT INTO settings(k,v) VALUES(?,?)");ins.run("name","الراعبي أوتو كارز");ins.run("site_name","الراعبي أوتو كارز");ins.run("phone","");ins.run("whatsapp","");}
if(ADMIN_PASSWORD){
 const a=db.prepare("SELECT id FROM admins WHERE username='admin'").get();
 if(!a)db.prepare("INSERT INTO admins(username,password_hash,role) VALUES('admin',?,'superadmin')").run(bcrypt.hashSync(ADMIN_PASSWORD,12));
}
const clean=r=>r?({...r,images:JSON.parse(r.images_json||"[]")}):null;
const audit=(actor,action,entity,id,meta={})=>db.prepare("INSERT INTO audit_log(actor,action,entity,entity_id,meta) VALUES(?,?,?,?,?)").run(actor,action,entity,id,JSON.stringify(meta));
function admin(req,res,next){const h=req.headers.authorization||"";if(!h.startsWith("Bearer "))return res.status(401).json({error:"Unauthorized"});try{req.user=jwt.verify(h.slice(7),JWT_SECRET);if(!req.user.admin)throw 0;next()}catch{return res.status(401).json({error:"Admin authentication required"})}}
function customer(req,res,next){const h=req.headers.authorization||"";if(!h.startsWith("Bearer "))return res.status(401).json({error:"Unauthorized"});try{req.user=jwt.verify(h.slice(7),JWT_SECRET);if(!req.user.customer)throw 0;next()}catch{return res.status(401).json({error:"Customer authentication required"})}}
app.use(helmet({crossOriginResourcePolicy:{policy:"cross-origin"}}));
app.use(cors({origin:true}));app.use(express.json({limit:"3mb"}));
app.use("/api",rateLimit({windowMs:15*60*1000,limit:500,standardHeaders:true,legacyHeaders:false}));
app.use("/api/auth",rateLimit({windowMs:15*60*1000,limit:30,standardHeaders:true,legacyHeaders:false}));
const storage=multer.diskStorage({destination:(_,__,cb)=>cb(null,UPLOADS),filename:(_,f,cb)=>cb(null,crypto.randomBytes(8).toString("hex")+"-"+Date.now()+path.extname(f.originalname).toLowerCase())});
const upload=multer({storage,limits:{files:10,fileSize:MAX_FILE},fileFilter:(_,f,cb)=>cb(/^image\/(jpeg|png|webp|gif)$/i.test(f.mimetype)?null:new Error("Only image files are allowed"))});

app.get("/api/health",(_,res)=>res.json({ok:true,version:"V19",cloud:true,time:new Date().toISOString(),features:["inventory","customers","orders","leads","settings","audit","pwa"]}));
app.post("/api/auth/login",(req,res)=>{const u=db.prepare("SELECT * FROM admins WHERE username=?").get(String(req.body?.username||""));if(!u||!bcrypt.compareSync(String(req.body?.password||""),u.password_hash))return res.status(401).json({error:"Invalid credentials"});res.json({token:jwt.sign({id:u.id,username:u.username,role:u.role,admin:true},JWT_SECRET,{expiresIn:"12h"}),user:{id:u.id,username:u.username,role:u.role}})});
app.post("/api/customers/register",(req,res)=>{const b=req.body||{};if(!b.name||!b.phone||String(b.password||"").length<6)return res.status(400).json({error:"Name, phone and password (6+) required"});try{const id=db.prepare("INSERT INTO customers(name,phone,email,password_hash) VALUES(?,?,?,?)").run(String(b.name).trim(),String(b.phone).trim(),String(b.email||"").trim(),bcrypt.hashSync(String(b.password),12)).lastInsertRowid;res.status(201).json({id})}catch{res.status(409).json({error:"Phone already registered"})}});
app.post("/api/customers/login",(req,res)=>{const u=db.prepare("SELECT * FROM customers WHERE phone=?").get(String(req.body?.phone||""));if(!u||!u.password_hash||!bcrypt.compareSync(String(req.body?.password||""),u.password_hash))return res.status(401).json({error:"Invalid credentials"});res.json({token:jwt.sign({id:u.id,customer:true},JWT_SECRET,{expiresIn:"7d"}),customer:{id:u.id,name:u.name,phone:u.phone,email:u.email}})});
app.get("/api/customers/me",customer,(req,res)=>{const u=db.prepare("SELECT id,name,phone,email,created_at FROM customers WHERE id=?").get(req.user.id);if(!u)return res.status(404).json({error:"Customer not found"});res.json(u)});
app.put("/api/customers/me",customer,(req,res)=>{const b=req.body||{};db.prepare("UPDATE customers SET name=?,email=? WHERE id=?").run(String(b.name||"").trim(),String(b.email||"").trim(),req.user.id);res.json(db.prepare("SELECT id,name,phone,email,created_at FROM customers WHERE id=?").get(req.user.id))});

app.get("/api/cars",(req,res)=>{
 let q=String(req.query.q||"").trim(),make=String(req.query.make||"").trim(),type=String(req.query.type||"").trim(),status=String(req.query.status||"").trim();
 let min=Number(req.query.min||0),max=Number(req.query.max||Number.MAX_SAFE_INTEGER),featured=req.query.featured;
 let page=Math.max(1,Number(req.query.page||1)),limit=Math.min(100,Math.max(1,Number(req.query.limit||50)));
 let sql="FROM cars WHERE price BETWEEN ? AND ?",args=[min,max];
 if(q){sql+=" AND (name LIKE ? OR make LIKE ? OR model LIKE ? OR type LIKE ?)";let s="%"+q+"%";args.push(s,s,s,s)}
 if(make){sql+=" AND make=?";args.push(make)} if(type){sql+=" AND type=?";args.push(type)}
 if(status){sql+=" AND status=?";args.push(status)} if(featured!==undefined){sql+=" AND featured=?";args.push(featured?1:0)}
 const total=db.prepare("SELECT COUNT(*) n "+sql).get(...args).n;
 const rows=db.prepare("SELECT * "+sql+" ORDER BY featured DESC,id DESC LIMIT ? OFFSET ?").all(...args,limit,(page-1)*limit);
 res.json({items:rows.map(clean),total,page,limit});
});
function saveCar(b,id=null){
 const imgs=Array.isArray(b.images)?b.images:[], featured=b.featured?1:0;
 if(id){db.prepare(`UPDATE cars SET name=?,make=?,model=?,year=?,price=?,currency=?,type=?,fuel=?,transmission=?,mileage=?,status=?,quantity=?,description=?,images_json=?,featured=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(b.name,b.make||"",b.model||"",+b.year||0,+b.price||0,b.currency||"USD",b.type||"",b.fuel||"",b.transmission||"",+b.mileage||0,b.status||"available",Math.max(0,+b.quantity||0),b.description||"",JSON.stringify(imgs),featured,id);return clean(db.prepare("SELECT * FROM cars WHERE id=?").get(id))}
 return clean(db.prepare(`INSERT INTO cars(name,make,model,year,price,currency,type,fuel,transmission,mileage,status,quantity,description,images_json,featured) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(b.name,b.make||"",b.model||"",+b.year||0,+b.price||0,b.currency||"USD",b.type||"",b.fuel||"",b.transmission||"",+b.mileage||0,b.status||"available",Math.max(0,+b.quantity||0),b.description||"",JSON.stringify(imgs),featured).lastInsertRowid)
}
app.post("/api/cars",admin,(req,res)=>{if(!req.body?.name)return res.status(400).json({error:"Car name required"});const c=saveCar(req.body);audit(req.user.username,"create","car",c.id);res.status(201).json(c)});
app.put("/api/cars/:id",admin,(req,res)=>{const id=+req.params.id;if(!db.prepare("SELECT id FROM cars WHERE id=?").get(id))return res.status(404).json({error:"Not found"});const c=saveCar(req.body,id);audit(req.user.username,"update","car",id);res.json(c)});
app.delete("/api/cars/:id",admin,(req,res)=>{const id=+req.params.id,x=db.prepare("DELETE FROM cars WHERE id=?").run(id);audit(req.user.username,"delete","car",id);res.json({ok:x.changes>0})});
app.post("/api/upload",admin,upload.array("images",10),(req,res)=>res.json({files:(req.files||[]).map(f=>"/uploads/"+f.filename)}));

app.post("/api/orders",(req,res)=>{const b=req.body||{};let cid=b.customer_id||null;try{const h=req.headers.authorization||"";if(!cid&&h.startsWith("Bearer ")){const u=jwt.verify(h.slice(7),JWT_SECRET);if(u.customer)cid=u.id}}catch{} if(!b.customer_name||!b.phone)return res.status(400).json({error:"Customer name and phone required"});const id=db.prepare("INSERT INTO orders(customer_id,customer_name,phone,car_id,car_name,notes,status) VALUES(?,?,?,?,?,?,?)").run(cid,String(b.customer_name).trim(),String(b.phone).trim(),b.car_id||null,b.car_name||"",b.notes||"","new").lastInsertRowid;if(cid)db.prepare("INSERT INTO notifications(customer_id,title,body) VALUES(?,?,?)").run(cid,"تم استلام طلبك",`رقم الطلب #${id}`);res.status(201).json({id,status:"new"})});
app.get("/api/orders",admin,(req,res)=>res.json(db.prepare("SELECT * FROM orders ORDER BY id DESC").all()));
app.get("/api/customers/me/orders",customer,(req,res)=>res.json(db.prepare("SELECT * FROM orders WHERE customer_id=? ORDER BY id DESC").all(req.user.id)));
app.patch("/api/orders/:id",admin,(req,res)=>{const s=String(req.body?.status||"new"),ok=["new","contacted","confirmed","completed","cancelled"];if(!ok.includes(s))return res.status(400).json({error:"Invalid status"});db.prepare("UPDATE orders SET status=? WHERE id=?").run(s,+req.params.id);audit(req.user.username,"status","order",+req.params.id,{status:s});res.json({ok:true})});
app.get("/api/customers",admin,(req,res)=>res.json(db.prepare("SELECT id,name,phone,email,created_at FROM customers ORDER BY id DESC").all()));
app.post("/api/leads",(req,res)=>{const b=req.body||{};if(!b.name||!b.phone)return res.status(400).json({error:"Name and phone required"});const id=db.prepare("INSERT INTO leads(customer_id,name,phone,type,car_id,car_name,notes,status) VALUES(?,?,?,?,?,?,?,?)").run(b.customer_id||null,b.name,b.phone,b.type||"inquiry",b.car_id||null,b.car_name||"",b.notes||"","new").lastInsertRowid;res.status(201).json({id})});
app.get("/api/leads",admin,(req,res)=>res.json(db.prepare("SELECT * FROM leads ORDER BY id DESC").all()));
app.patch("/api/leads/:id",admin,(req,res)=>{db.prepare("UPDATE leads SET status=? WHERE id=?").run(String(req.body?.status||"new"),+req.params.id);res.json({ok:true})});
app.get("/api/stats",admin,(req,res)=>{const n=t=>db.prepare("SELECT COUNT(*) n FROM "+t).get().n;res.json({cars:n("cars"),customers:n("customers"),orders:n("orders"),leads:n("leads"),available:db.prepare("SELECT COALESCE(SUM(quantity),0) n FROM cars WHERE status='available'").get().n,featured:db.prepare("SELECT COUNT(*) n FROM cars WHERE featured=1").get().n})});
app.get("/api/settings",(_,res)=>res.json(Object.fromEntries(db.prepare("SELECT k,v FROM settings").all().map(x=>[x.k,x.v]))));
app.put("/api/settings",admin,(req,res)=>{const tx=db.transaction(o=>{for(const[k,v]of Object.entries(o||{}))db.prepare("INSERT INTO settings(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").run(k,String(v))});tx(req.body);audit(req.user.username,"update","settings",0);res.json({ok:true})});
app.get("/api/audit",admin,(req,res)=>res.json(db.prepare("SELECT * FROM audit_log ORDER BY id DESC LIMIT 300").all()));

app.get("/api/offers",(_,res)=>res.json(db.prepare("SELECT * FROM offers WHERE active=1 ORDER BY id DESC").all()));
app.post("/api/offers",admin,(req,res)=>{const b=req.body||{};if(!b.title)return res.status(400).json({error:"Title required"});const id=db.prepare("INSERT INTO offers(title,description,discount,car_id,start_at,end_at,active) VALUES(?,?,?,?,?,?,?)").run(b.title,b.description||"",+b.discount||0,b.car_id||null,b.start_at||null,b.end_at||null,b.active===false?0:1).lastInsertRowid;audit(req.user.username,"create","offer",id);res.status(201).json({id})});
app.patch("/api/offers/:id",admin,(req,res)=>{const b=req.body||{};db.prepare("UPDATE offers SET title=COALESCE(?,title),description=COALESCE(?,description),discount=COALESCE(?,discount),active=COALESCE(?,active) WHERE id=?").run(b.title??null,b.description??null,b.discount??null,b.active==null?null:(b.active?1:0),+req.params.id);res.json({ok:true})});
app.delete("/api/offers/:id",admin,(req,res)=>{db.prepare("DELETE FROM offers WHERE id=?").run(+req.params.id);res.json({ok:true})});
app.get("/api/coupons",admin,(req,res)=>res.json(db.prepare("SELECT * FROM coupons ORDER BY id DESC").all()));
app.post("/api/coupons",admin,(req,res)=>{const b=req.body||{};if(!b.code)return res.status(400).json({error:"Code required"});try{const id=db.prepare("INSERT INTO coupons(code,discount,kind,max_uses,expires_at,active) VALUES(?,?,?,?,?,?)").run(String(b.code).trim().toUpperCase(),+b.discount||0,b.kind||"percent",+b.max_uses||0,b.expires_at||null,b.active===false?0:1).lastInsertRowid;res.status(201).json({id})}catch{return res.status(409).json({error:"Coupon already exists"})}});
app.patch("/api/coupons/:id",admin,(req,res)=>{const b=req.body||{};db.prepare("UPDATE coupons SET active=COALESCE(?,active),discount=COALESCE(?,discount),max_uses=COALESCE(?,max_uses) WHERE id=?").run(b.active==null?null:(b.active?1:0),b.discount??null,b.max_uses??null,+req.params.id);res.json({ok:true})});
app.post("/api/coupons/check",(req,res)=>{const code=String(req.body?.code||"").trim().toUpperCase(),c=db.prepare("SELECT * FROM coupons WHERE code=? AND active=1").get(code);if(!c)return res.status(404).json({valid:false,error:"Invalid coupon"});if(c.max_uses>0&&c.uses>=c.max_uses)return res.status(400).json({valid:false,error:"Coupon limit reached"});if(c.expires_at&&new Date(c.expires_at)<new Date())return res.status(400).json({valid:false,error:"Coupon expired"});res.json({valid:true,discount:c.discount,kind:c.kind})});
app.post("/api/appointments",(req,res)=>{const b=req.body||{};if(!b.name||!b.phone||!b.date||!b.time)return res.status(400).json({error:"Name, phone, date and time required"});let cid=b.customer_id||null;try{const h=req.headers.authorization||"";if(!cid&&h.startsWith("Bearer ")){const u=jwt.verify(h.slice(7),JWT_SECRET);if(u.customer)cid=u.id}}catch{}const id=db.prepare("INSERT INTO appointments(customer_id,name,phone,car_id,car_name,date,time,notes,status) VALUES(?,?,?,?,?,?,?,?,?)").run(cid,b.name,b.phone,b.car_id||null,b.car_name||"",b.date,b.time,b.notes||"","new").lastInsertRowid;if(cid)db.prepare("INSERT INTO notifications(customer_id,title,body) VALUES(?,?,?)").run(cid,"تم استلام حجز تجربة القيادة",`${b.date} ${b.time}`);res.status(201).json({id,status:"new"})});
app.get("/api/appointments",admin,(req,res)=>res.json(db.prepare("SELECT * FROM appointments ORDER BY date DESC,time DESC,id DESC").all()));
app.patch("/api/appointments/:id",admin,(req,res)=>{db.prepare("UPDATE appointments SET status=? WHERE id=?").run(String(req.body?.status||"new"),+req.params.id);res.json({ok:true})});
app.get("/api/customers/me/notifications",customer,(req,res)=>res.json(db.prepare("SELECT * FROM notifications WHERE customer_id=? ORDER BY id DESC LIMIT 100").all(req.user.id)));
app.patch("/api/customers/me/notifications/:id/read",customer,(req,res)=>{db.prepare("UPDATE notifications SET read_at=CURRENT_TIMESTAMP WHERE id=? AND customer_id=?").run(+req.params.id,req.user.id);res.json({ok:true})});
app.get("/api/customers/me",customer,(req,res)=>{const u=db.prepare("SELECT id,name,phone,email,created_at FROM customers WHERE id=?").get(req.user.id);if(!u)return res.status(404).json({error:"Customer not found"});res.json(u)});
app.get("/api/export",admin,(req,res)=>{res.json({version:"V19-FINAL-MASTER",exported_at:new Date().toISOString(),cars:db.prepare("SELECT * FROM cars").all().map(clean),customers:db.prepare("SELECT id,name,phone,email,created_at FROM customers").all(),orders:db.prepare("SELECT * FROM orders").all(),leads:db.prepare("SELECT * FROM leads").all(),offers:db.prepare("SELECT * FROM offers").all(),coupons:db.prepare("SELECT * FROM coupons").all(),appointments:db.prepare("SELECT * FROM appointments").all(),settings:Object.fromEntries(db.prepare("SELECT k,v FROM settings").all().map(x=>[x.k,x.v]))})});

app.use("/uploads",express.static(UPLOADS));app.use(express.static(ROOT));
app.use((req,res)=>req.path.startsWith("/api/")?res.status(404).json({error:"API endpoint not found"}):res.sendFile(path.join(ROOT,"index.html")));
app.use((e,req,res,next)=>{console.error(e);res.status(400).json({error:e.message||"Server error"})});
if(JWT_SECRET.startsWith("CHANGE_ME_")) console.warn("WARNING: set JWT_SECRET in production");
if(!ADMIN_PASSWORD) console.warn("WARNING: set ADMIN_PASSWORD before first production start");
app.listen(PORT,()=>console.log("ALRAEBI AUTO CARS V19 CLOUD PRO on "+PORT));
