/**
 * tNic / TalentBridge — Cloud Functions
 *
 * onSwipeCreated: detecta match mutuo cuando un user crea un swipe de tipo
 * "like" sobre otro user que ya le había dado like. Crea un doc en /matches
 * con ID determinístico (uids ordenados unidos por "_") para evitar duplicados.
 *
 * Implementación en Functions v1 — usa el trigger nativo de Firestore (no
 * pasa por Eventarc). Más confiable en proyectos donde los Service Agents
 * de Eventarc / Pub/Sub no se propagaron correctamente al crear la base.
 */

const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.matchOnSwipe = functions
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

    await db.collection("matches").doc(matchId).set(
      {
        users: sortedUids,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        hasChat: false,
      },
      { merge: true }
    );

    console.log(`Match creado: ${matchId}`);
    return null;
  });
