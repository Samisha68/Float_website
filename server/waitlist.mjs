import { randomUUID } from "node:crypto";

export function createWaitlistHandler({ configured, verify, getEmail, save, log = console.info }) {
  return async (req, res) => {
    const requestId = randomUUID();
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Request-Id", requestId);
    const reply = (status, code) => res.status(status).json(status === 200 ? { ok: true } : { ok: false, code });
    if (req.method !== "POST") { res.setHeader("Allow", "POST"); return reply(405, "METHOD_NOT_ALLOWED"); }
    if (!req.headers["content-type"]?.startsWith("application/json")) return reply(415, "JSON_REQUIRED");
    const authorization = req.headers.authorization;
    if (typeof authorization !== "string" || !/^Bearer [^ ]+$/.test(authorization) || authorization.length > 8192) return reply(401, "SIGN_IN_REQUIRED");
    let body;
    try {
      const raw = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? null);
      if (Buffer.byteLength(raw) > 4096) return reply(413, "BODY_TOO_LARGE");
      body = JSON.parse(raw);
    } catch { return reply(400, "INVALID_JSON"); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return reply(400, "INVALID_JSON");
    const text = (value, max) => typeof value === "string" && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value);
    const socials = body.socials == null || body.socials === "" ? null : body.socials;
    if (!text(body.business, 160) || body.business.trim().length === 0) return reply(400, "INVALID_BUSINESS");
    if (typeof body.community !== "boolean") return reply(400, "INVALID_COMMUNITY");
    if (socials !== null && !text(socials, 200)) return reply(400, "INVALID_SOCIALS");
    if (!configured()) { log(JSON.stringify({ event: "waitlist.unconfigured", requestId })); return reply(503, "SIGNUP_UNAVAILABLE"); }
    let identity;
    try { identity = await verify(authorization.slice(7)); }
    catch (error) {
      const invalidToken = ["ERR_JWT_EXPIRED", "ERR_JWT_CLAIM_VALIDATION_FAILED", "ERR_JWS_SIGNATURE_VERIFICATION_FAILED", "ERR_JWS_INVALID", "ERR_JWT_INVALID", "ERR_JOSE_ALG_NOT_ALLOWED", "ERR_JWKS_NO_MATCHING_KEY"].includes(error.code);
      log(JSON.stringify({ event: invalidToken ? "waitlist.auth_rejected" : "waitlist.auth_unavailable", requestId, code: error.code || error.name }));
      return reply(invalidToken ? 401 : 503, invalidToken ? "SIGN_IN_REQUIRED" : "SIGNUP_UNAVAILABLE");
    }
    if (typeof identity?.sub !== "string" || !identity.sub.startsWith("did:privy:")) return reply(401, "SIGN_IN_REQUIRED");
    try {
      const email = await getEmail(identity.sub);
      if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(422, "VERIFIED_EMAIL_REQUIRED");
      await save({ privyId: identity.sub, email: email.toLowerCase(), business: body.business.trim(), community: body.community, socials: socials === null ? null : socials.trim() || null });
      log(JSON.stringify({ event: "waitlist.saved", requestId }));
      return reply(200);
    } catch (error) {
      // Never log request bodies, access tokens, contact data, or database URLs.
      log(JSON.stringify({ event: "waitlist.save_failed", requestId, code: error.code || error.name }));
      return reply(503, "SIGNUP_UNAVAILABLE");
    }
  };
}
