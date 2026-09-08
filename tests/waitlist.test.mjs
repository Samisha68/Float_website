import test from "node:test";
import assert from "node:assert/strict";
import { createWaitlistHandler } from "../server/waitlist.mjs";
function harness(overrides = {}) {
  const records = new Map(); let writes = 0;
  const handler = createWaitlistHandler({ configured: () => true, verify: async () => ({ sub: "did:privy:test" }), getEmail: async () => "Verified@Example.com", save: async record => { writes++; if (!records.has(record.privyId)) records.set(record.privyId, record); }, log: () => {}, ...overrides });
  return { records, get writes() { return writes; }, async request(changes = {}) {
    const req = { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer signed-token" }, body: { business: " Coffee roastery ", community: true, socials: " @float " }, ...changes };
    const res = { headers: {}, setHeader(k,v) { this.headers[k]=v; }, status(s) { this.code=s; return this; }, json(b) { this.body=b; return this; } };
    await handler(req,res); return res;
  } };
}
test("takes identity from the token and email from Privy, never from the body", async () => { const h=harness(); assert.equal((await h.request({body:{business:"Test Co",community:true,socials:null,email:"attacker@example.com",privyId:"victim"}})).code,200); assert.deepEqual(h.records.get("did:privy:test"),{privyId:"did:privy:test",email:"verified@example.com",business:"Test Co",community:true,socials:null}); });
test("trims the submitted fields", async () => { const h=harness(); assert.equal((await h.request()).code,200); assert.deepEqual(h.records.get("did:privy:test"),{privyId:"did:privy:test",email:"verified@example.com",business:"Coffee roastery",community:true,socials:"@float"}); });
test("socials are optional and normalise to null", async () => { const h=harness(); for(const socials of [undefined,null,"","   "]){h.records.clear(); assert.equal((await h.request({body:{business:"Test Co",community:false,socials}})).code,200); assert.equal(h.records.get("did:privy:test").socials,null);} });
test("requires a business and an explicit community answer", async () => { const h=harness(); for(const body of [{community:true},{business:"   ",community:true},{business:"x".repeat(161),community:true},{business:42,community:true}]){assert.equal((await h.request({body})).code,400);} for(const body of [{business:"Test Co"},{business:"Test Co",community:"yes"},{business:"Test Co",community:null}]){assert.equal((await h.request({body})).code,400);} assert.equal((await h.request({body:{business:"Test Co",community:false}})).code,200); });
test("rejects oversized socials", async () => { const h=harness(); assert.equal((await h.request({body:{business:"Test Co",community:true,socials:"x".repeat(201)}})).code,400); assert.equal(h.writes,0); });
test("no anonymous reads or writes", async () => { const h=harness(); assert.equal((await h.request({method:"GET"})).code,405); assert.equal((await h.request({headers:{"content-type":"application/json"}})).code,401); assert.equal(h.writes,0); });
test("rejects malformed and oversized payloads",async()=>{const h=harness(); for(const body of [null,[],"{broken"]){assert.equal((await h.request({body})).code,400);}assert.equal((await h.request({body:"a".repeat(5000)})).code,413);assert.equal(h.writes,0);});
test("rejects non-JSON requests",async()=>{const h=harness();assert.equal((await h.request({headers:{"content-type":"text/plain",authorization:"Bearer signed-token"}})).code,415);assert.equal(h.writes,0);});
test("rejects expired or forged tokens before persistence",async()=>{for(const code of ["ERR_JWT_EXPIRED","ERR_JWS_SIGNATURE_VERIFICATION_FAILED","ERR_JWT_CLAIM_VALIDATION_FAILED"]){const h=harness({verify:async()=>{throw Object.assign(new Error(),{code})}});assert.equal((await h.request()).code,401);assert.equal(h.writes,0);}});
test("rejects a subject that is not a Privy identity",async()=>{const h=harness({verify:async()=>({sub:"did:example:test"})});assert.equal((await h.request()).code,401);assert.equal(h.writes,0);});
test("configuration and signing-key failures never report success",async()=>{for(const overrides of [{configured:()=>false},{verify:async()=>{throw new TypeError("network")}}]){const h=harness(overrides);assert.equal((await h.request()).code,503);assert.equal(h.writes,0);}});
test("requires a verified contact email",async()=>{const h=harness({getEmail:async()=>null});assert.equal((await h.request()).code,422);assert.equal(h.writes,0);});
test("database timeout never reports a saved place",async()=>{const h=harness({save:async()=>{throw new Error("timeout")}});const res=await h.request();assert.equal(res.code,503);assert.equal(res.body.ok,false);});
test("retries preserve one record per identity",async()=>{const h=harness();await Promise.all([h.request(),h.request()]);assert.equal(h.records.size,1);});
