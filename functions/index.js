/**
 * tNic / TalentBridge — Cloud Functions
 *
 * Funciones desplegadas:
 *   matchOnSwipe        — al crearse un swipe, detecta match mutuo y lo crea en /matches.
 *                         Después dispara emails de notificación a ambos usuarios.
 *   sendWelcomeEmail    — al crearse un usuario en Auth, le manda email de bienvenida.
 *   onInterviewCreated  — al crearse un doc en /interviews, le manda email al candidato
 *                         con la info de la entrevista.
 *
 * Todas son Functions v1 con triggers nativos (no Eventarc). Service account:
 * tnic-app@appspot.gserviceaccount.com con roles/datastore.user.
 *
 * Config requerida:
 *   secret SENDGRID_KEY  — API key con permiso "Mail Send"
 *                          set vía: firebase functions:secrets:set SENDGRID_KEY
 *   param  SENDGRID_FROM      — email FROM verificado (default: noreply@tnictalent.com)
 *   param  SENDGRID_FROM_NAME — nombre del remitente (default: tNic)
 */

const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const { defineSecret, defineString } = require("firebase-functions/params");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();
const db = admin.firestore();

// ── SendGrid setup ──────────────────────────────────────────────────────
const SENDGRID_KEY = defineSecret("SENDGRID_KEY");
const SENDGRID_FROM = defineString("SENDGRID_FROM", { default: "noreply@tnictalent.com" });
const SENDGRID_FROM_NAME = defineString("SENDGRID_FROM_NAME", { default: "tNic" });
const APP_URL = "https://www.tnictalent.com/app/";

// Inicialización lazy de SendGrid — se hace dentro de cada handler porque
// el secret sólo está disponible en tiempo de ejecución (no en parse time).
function ensureSendgrid() {
  const k = SENDGRID_KEY.value();
  if (k) { sgMail.setApiKey(k); return true; }
  console.warn("⚠️ SENDGRID_KEY no está configurado — los emails NO se enviarán.");
  return false;
}

/**
 * Envía un email. Si SendGrid no está configurado, logueamos y seguimos.
 * Nunca tiramos error: las funciones de Firestore no deben fallar por culpa del email.
 */
async function sendEmail(to, subject, html) {
  if (!ensureSendgrid()) return;
  if (!to) {
    console.warn(`sendEmail skipped (no recipient). subject="${subject}"`);
    return;
  }
  try {
    await sgMail.send({
      to,
      from: { email: SENDGRID_FROM.value(), name: SENDGRID_FROM_NAME.value() },
      subject,
      html,
    });
    console.log(`✉️ Email enviado a ${to} — "${subject}"`);
  } catch (err) {
    console.error(`Error enviando email a ${to}:`, err && err.response ? err.response.body : err);
  }
}

// ── Push helper ─────────────────────────────────────────────────────────
/**
 * Envía una push notif a todos los tokens FCM guardados en users/{uid}.fcmTokens.
 * Limpia automáticamente los tokens inválidos (devices que desinstalaron, etc.).
 * Nunca tira: si el user no tiene tokens, simplemente no hace nada.
 */
async function sendPushToUser(uid, payload) {
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) return;
    const tokens = Array.isArray(userDoc.data().fcmTokens) ? userDoc.data().fcmTokens : [];
    if (!tokens.length) return;

    // Filtrar data: FCM exige que TODOS los values en `data` sean strings.
    const safeData = {};
    if (payload.data && typeof payload.data === "object") {
      Object.keys(payload.data).forEach((k) => {
        const v = payload.data[k];
        if (v != null) safeData[k] = String(v);
      });
    }

    const baseMsg = {
      notification: {
        title: payload.title || "tNic",
        body: payload.body || "",
      },
      data: safeData,
      webpush: {
        notification: {
          icon: "https://www.tnictalent.com/icon-192.png",
          badge: "https://www.tnictalent.com/icon-192.png",
        },
        fcmOptions: { link: "https://www.tnictalent.com/app/" },
      },
    };

    const results = await Promise.allSettled(
      tokens.map((t) => admin.messaging().send({ ...baseMsg, token: t }))
    );

    const toRemove = [];
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        const code = (r.reason && r.reason.code) || "";
        const tokenShort = tokens[i].substring(0, 12);
        // Solo borrar tokens si el error indica que el token específicamente no es válido.
        // `invalid-argument` suele ser problema de payload, NO del token.
        if (
          code === "messaging/invalid-registration-token" ||
          code === "messaging/registration-token-not-registered"
        ) {
          console.warn(`Token inválido ${tokenShort}... — code=${code}`);
          toRemove.push(tokens[i]);
        } else {
          console.error(`FCM send error (${tokenShort}...) code=${code}:`, (r.reason && r.reason.message) || r.reason);
        }
      }
    });

    if (toRemove.length) {
      await db.collection("users").doc(uid).update({
        fcmTokens: admin.firestore.FieldValue.arrayRemove(...toRemove),
      });
      console.log(`Limpiados ${toRemove.length} tokens FCM inválidos de ${uid}`);
    }

    const ok = results.filter((r) => r.status === "fulfilled").length;
    if (ok > 0) console.log(`📱 Push enviada a ${uid} (${ok}/${tokens.length} devices) — "${payload.title}"`);
  } catch (e) {
    console.error(`sendPushToUser error para ${uid}:`, e);
  }
}

/**
 * Devuelve un objeto con { email, displayName } para un uid dado.
 * Lee de Firestore (/candidates o /companies). NO usa admin.auth().getUser()
 * porque la service account de gen 1 funciones no tiene permiso para Auth
 * y daba "insufficient permission". El cliente publica el email en el perfil.
 */
async function getUserInfo(uid) {
  try {
    const cand = await db.collection("candidates").doc(uid).get();
    if (cand.exists) {
      const d = cand.data();
      return { email: d.email || null, displayName: d.name || null, kind: "candidate" };
    }
    const comp = await db.collection("companies").doc(uid).get();
    if (comp.exists) {
      const d = comp.data();
      return { email: d.email || null, displayName: d.name || null, kind: "company" };
    }
  } catch (e) {
    console.warn(`Lookup de perfil falló para ${uid}:`, e.message);
  }
  return { email: null, displayName: null, kind: null };
}

// ── HTML helpers ────────────────────────────────────────────────────────
function htmlShell(innerHtml) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#F4F7FF;font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#18181B">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FF;padding:32px 16px">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 2px 16px rgba(43,92,230,.10)">
      <tr><td style="background:linear-gradient(135deg,#0F172A,#2B5CE6);padding:24px 28px;color:#fff">
        <div style="font-family:'Syne',Arial,sans-serif;font-size:24px;font-weight:800;letter-spacing:-.5px">tNic</div>
        <div style="font-size:11px;color:rgba(255,255,255,.7);margin-top:2px">Matching real entre talento IT y empresas</div>
      </td></tr>
      <tr><td style="padding:28px 28px 24px 28px;font-size:14px;line-height:1.6;color:#18181B">
        ${innerHtml}
      </td></tr>
      <tr><td style="padding:16px 28px;border-top:1px solid #E4E4E7;font-size:11px;color:#71717A;background:#FAFAFA">
        Recibís este email porque tenés una cuenta en tNic. Este es un mensaje automático, por favor no respondas a este correo.
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function ctaButton(label, href) {
  return `<a href="${href}" style="display:inline-block;background:#2B5CE6;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:24px;margin-top:8px">${label}</a>`;
}

function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── 1) Welcome email — Auth user onCreate ───────────────────────────────
exports.sendWelcomeEmail = functions
  .runWith({ secrets: [SENDGRID_KEY] })
  .region("us-central1")
  .auth.user()
  .onCreate(async (user) => {
    if (!user || !user.email) {
      console.log("Welcome skipped: usuario sin email", user && user.uid);
      return null;
    }
    const name = user.displayName ? user.displayName.split(" ")[0] : "";
    const greet = name ? `¡Hola ${escapeHtml(name)}!` : "¡Hola!";
    const html = htmlShell(`
      <h1 style="margin:0 0 12px 0;font-family:'Syne',Arial,sans-serif;font-size:22px;color:#0F172A">${greet} 🎉</h1>
      <p style="margin:0 0 12px 0">Gracias por sumarte a <strong>tNic</strong>. Tu cuenta ya está activa.</p>
      <p style="margin:0 0 16px 0">Para arrancar:</p>
      <ul style="margin:0 0 20px 18px;padding:0;color:#3F3F46">
        <li style="margin-bottom:6px">Completá tu perfil (tarda menos de 2 minutos).</li>
        <li style="margin-bottom:6px">Hacé swipe en los perfiles del otro lado del mercado.</li>
        <li style="margin-bottom:6px">Cuando haya <em>Mutual Interest</em>, te avisamos por acá y abren un chat directo.</li>
      </ul>
      <div>${ctaButton("Entrar a tNic →", APP_URL)}</div>
      <p style="margin:24px 0 0 0;font-size:12px;color:#71717A">Cualquier duda, escribinos a hola@tnictalent.com.</p>
    `);
    await sendEmail(user.email, "¡Bienvenido/a a tNic! 🎉", html);
    return null;
  });

// ── Helper: emails + push de match ───────────────────────────────────────
async function sendMatchEmails(uidA, uidB) {
  const [a, b] = await Promise.all([getUserInfo(uidA), getUserInfo(uidB)]);
  const aName = a.displayName || "alguien";
  const bName = b.displayName || "alguien";
  const matchHtml = (otherName) => htmlShell(`
    <h1 style="margin:0 0 12px 0;font-family:'Syne',Arial,sans-serif;font-size:22px;color:#0F172A">🎉 ¡Tenés un Mutual Interest!</h1>
    <p style="margin:0 0 12px 0">Conectaste con <strong>${escapeHtml(otherName)}</strong> en tNic.</p>
    <p style="margin:0 0 16px 0">Ya pueden chatear directamente desde la app y coordinar los próximos pasos.</p>
    <div>${ctaButton("Abrir chat en tNic →", APP_URL)}</div>
  `);
  // Emails (en paralelo)
  const emailJobs = [];
  if (a.email) emailJobs.push(sendEmail(a.email, `🎉 Conectaste con ${bName} en tNic`, matchHtml(bName)));
  if (b.email) emailJobs.push(sendEmail(b.email, `🎉 Conectaste con ${aName} en tNic`, matchHtml(aName)));
  // Push (en paralelo)
  const pushJobs = [
    sendPushToUser(uidA, { title: "🎉 Mutual Interest", body: `Conectaste con ${bName}`, data: { type: "match", with: uidB } }),
    sendPushToUser(uidB, { title: "🎉 Mutual Interest", body: `Conectaste con ${aName}`, data: { type: "match", with: uidA } }),
  ];
  await Promise.all(emailJobs.concat(pushJobs));
}

// ── 2) matchOnSwipe — detecta reciprocidad y dispara emails ─────────────
exports.matchOnSwipe = functions
  .runWith({ secrets: [SENDGRID_KEY] })
  .region("us-central1")
  .firestore.document("swipes/{swipeId}")
  .onCreate(async (snap, context) => {
    const swipe = snap.data();
    if (!swipe || !swipe.from || !swipe.to) {
      console.warn("Swipe inválido — falta from o to", context.params.swipeId);
      return null;
    }
    if (swipe.kind !== "like") return null;
    if (swipe.from === swipe.to) return null;

    const reciprocal = await db
      .collection("swipes")
      .where("from", "==", swipe.to)
      .where("to", "==", swipe.from)
      .where("kind", "==", "like")
      .limit(1)
      .get();

    if (reciprocal.empty) {
      console.log(`Like de ${swipe.from} → ${swipe.to}: sin reciprocidad todavía`);
      return null;
    }

    const sortedUids = [swipe.from, swipe.to].sort();
    const matchId = sortedUids.join("_");

    // Sólo enviar emails si el match es NUEVO (no había existido). Para detectarlo,
    // leemos antes y comparamos. Si ya existe con un createdAt previo, asumimos
    // que es re-trigger y no spameamos.
    const existing = await db.collection("matches").doc(matchId).get();
    const isNew = !existing.exists;

    await db.collection("matches").doc(matchId).set(
      {
        users: sortedUids,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        hasChat: false,
      },
      { merge: true }
    );

    console.log(`Match ${isNew ? "creado" : "ya existía"}: ${matchId}`);

    if (isNew) {
      try {
        await sendMatchEmails(swipe.from, swipe.to);
      } catch (e) {
        console.error("sendMatchEmails falló:", e);
      }
    }
    return null;
  });

// ── 3) onInterviewCreated — email al candidato con los datos ────────────
function formatDateEs(dateStr) {
  // dateStr esperado YYYY-MM-DD; devolvemos formato más amigable
  if (!dateStr || dateStr.indexOf("-") === -1) return dateStr || "";
  const [y, m, d] = dateStr.split("-");
  const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return `${parseInt(d, 10)} de ${months[parseInt(m, 10) - 1] || ""} de ${y}`;
}
function platformLabel(p) {
  return { meet: "Google Meet", zoom: "Zoom", teams: "Microsoft Teams", presencial: "Presencial" }[p] || p || "—";
}

exports.onInterviewCreated = functions
  .runWith({ secrets: [SENDGRID_KEY] })
  .region("us-central1")
  .firestore.document("interviews/{interviewId}")
  .onCreate(async (snap, context) => {
    const iv = snap.data();
    if (!iv) return null;
    const candidateUid = iv.candidateUid;
    const companyUid = iv.companyUid;
    if (!candidateUid) {
      console.warn("Interview sin candidateUid", context.params.interviewId);
      return null;
    }

    // Resolver email del candidato (preferimos el de Auth, fallback al campo del doc)
    let candEmail = iv.candidateEmail || null;
    let candName = iv.candidateName || "";
    try {
      const info = await getUserInfo(candidateUid);
      if (info.email) candEmail = info.email;
      if (!candName && info.displayName) candName = info.displayName;
    } catch (e) { console.warn("getUserInfo candidato:", e.message); }

    if (!candEmail) {
      console.warn("No hay email del candidato — interview", context.params.interviewId);
      return null;
    }

    let companyName = iv.companyName || "";
    if (!companyName && companyUid) {
      try { const ci = await getUserInfo(companyUid); companyName = ci.displayName || "una empresa"; }
      catch (e) { /* noop */ }
    }
    if (!companyName) companyName = "una empresa";

    const dateLabel = formatDateEs(iv.date || "");
    const time = iv.time || "";
    const duration = iv.duration || "";
    const platform = platformLabel(iv.platform);
    const link = iv.link || "";
    const notes = iv.notes || "";

    const linkRow = link
      ? `<tr><td style="padding:6px 0;color:#71717A;font-size:12px">Link</td><td style="padding:6px 0"><a href="${escapeHtml(link)}" style="color:#2B5CE6;text-decoration:none;word-break:break-all">${escapeHtml(link)}</a></td></tr>`
      : "";
    const notesRow = notes
      ? `<tr><td style="padding:6px 0;color:#71717A;font-size:12px">Notas</td><td style="padding:6px 0">${escapeHtml(notes)}</td></tr>`
      : "";

    const html = htmlShell(`
      <h1 style="margin:0 0 8px 0;font-family:'Syne',Arial,sans-serif;font-size:22px;color:#0F172A">📅 Entrevista agendada</h1>
      <p style="margin:0 0 16px 0"><strong>${escapeHtml(companyName)}</strong> te agendó una entrevista.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E4E4E7;border-bottom:1px solid #E4E4E7;margin:0 0 18px 0">
        <tr><td style="padding:6px 0;color:#71717A;font-size:12px;width:90px">Fecha</td><td style="padding:6px 0">${escapeHtml(dateLabel)}</td></tr>
        <tr><td style="padding:6px 0;color:#71717A;font-size:12px">Hora</td><td style="padding:6px 0">${escapeHtml(time)}${duration ? " · " + escapeHtml(duration) : ""}</td></tr>
        <tr><td style="padding:6px 0;color:#71717A;font-size:12px">Plataforma</td><td style="padding:6px 0">${escapeHtml(platform)}</td></tr>
        ${linkRow}
        ${notesRow}
      </table>
      <div>${ctaButton("Ver en tNic →", APP_URL)}</div>
      <p style="margin:18px 0 0 0;font-size:12px;color:#71717A">Si necesitás reprogramar, contactá a la empresa por el chat de tNic.</p>
    `);
    await sendEmail(candEmail, `📅 Entrevista con ${companyName} — ${dateLabel} ${time}`.trim(), html);
    await sendPushToUser(candidateUid, {
      title: `📅 Entrevista con ${companyName}`,
      body: `${dateLabel} a las ${time}${platform ? " · " + platform : ""}`,
      data: { type: "interview", interviewId: context.params.interviewId },
    });
    return null;
  });

// ── 4) onMessageCreated — push al otro participante del chat ────────────
exports.onMessageCreated = functions
  .runWith({ secrets: [SENDGRID_KEY] })
  .region("us-central1")
  .firestore.document("matches/{matchId}/messages/{messageId}")
  .onCreate(async (snap, context) => {
    const msg = snap.data();
    if (!msg || !msg.from || !msg.text) return null;

    const matchDoc = await db.collection("matches").doc(context.params.matchId).get();
    if (!matchDoc.exists) return null;
    const users = (matchDoc.data() || {}).users || [];
    const recipient = users.find((u) => u !== msg.from);
    if (!recipient) return null;

    const sender = await getUserInfo(msg.from);
    const senderName = sender.displayName || "Alguien";
    const preview = msg.text.length > 100 ? msg.text.substring(0, 100) + "…" : msg.text;

    await sendPushToUser(recipient, {
      title: senderName,
      body: preview,
      data: { type: "message", matchId: context.params.matchId, senderUid: msg.from },
    });
    return null;
  });
