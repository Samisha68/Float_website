import test from "node:test";
import assert from "node:assert/strict";
import { createWaitlistHandler } from "../server/waitlist.mjs";
function harness(overrides = {}) {
  const records = new Map(); let writes = 0;
  const handler = createWaitlistHandler({ configured: () => true, verify: async () => ({ sub: "did:privy:test" }), getEmail: async () => "Verified@Example.com", save: async record => { writes++; if (!records.has(record.privyId)) records.set(record.privyId, record); }, log: () => {}, ...overrides });
  return { records, get writes() { return writes; }, async request(changes = {}) {
    const req = { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer signed-token" }, body: { name: " Alex ", business: " Test Co " }, ...changes };
    const res = { headers: {}, setHeader(k,v) { this.headers[k]=v; }, status(s) { this.code=s; return this; }, json(b) { this.body=b; return this; } };
    await handler(req,res); return res;
  } };
}
test("saves only the verified identity and email, ignoring forged body claims", async () => { const h=harness(); assert.equal((await h.request({body:{name:" Alex ",business:" Test Co ",email:"attacker@example.com",privyId:"victim"}})).code,200); assert.deepEqual(h.records.get("did:privy:test"),{privyId:"did:privy:test",email:"verified@example.com",name:"Alex",business:"Test Co"}); });
test("no anonymous reads or writes", async () => { const h=harness(); assert.equal((await h.request({method:"GET"})).code,405); assert.equal((await h.request({headers:{"content-type":"application/json"}})).code,401); assert.equal(h.writes,0); });
test("rejects missing, blank, oversized and malformed data",async()=>{const h=harness(); for(const body of [null,{},[],{name:" ",business:"x"},{name:42,business:"x"},{name:"a",business:"x".repeat(161)},"{broken"]){assert.equal((await h.request({body})).code,400);}assert.equal((await h.request({body:"a".repeat(5000)})).code,413);assert.equal(h.writes,0);});
test("rejects expired or forged tokens before persistence",async()=>{for(const code of ["ERR_JWT_EXPIRED","ERR_JWS_SIGNATURE_VERIFICATION_FAILED","ERR_JWT_CLAIM_VALIDATION_FAILED"]){const h=harness({verify:async()=>{throw Object.assign(new Error(),{code})}});assert.equal((await h.request()).code,401);assert.equal(h.writes,0);}});
test("configuration and signing-key failures never report success",async()=>{for(const overrides of [{configured:()=>false},{verify:async()=>{throw new TypeError("network")}}]){const h=harness(overrides);assert.equal((await h.request()).code,503);assert.equal(h.writes,0);}});
test("requires a verified contact email",async()=>{const h=harness({getEmail:async()=>null});assert.equal((await h.request()).code,422);assert.equal(h.writes,0);});
test("database timeout never reports a saved place",async()=>{const h=harness({save:async()=>{throw new Error("timeout")}});const res=await h.request();assert.equal(res.code,503);assert.equal(res.body.ok,false);});
test("retries preserve one record per identity",async()=>{const h=harness();await Promise.all([h.request(),h.request()]);assert.equal(h.records.size,1);});
