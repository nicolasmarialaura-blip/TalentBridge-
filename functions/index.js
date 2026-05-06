/**
 * tNic / TalentBridge — Cloud Functions
 *
 * onSwipeCreated: detecta match mutuo cuando un user crea un swipe de tipo
 * "like" sobre otro user que ya le había dado like. Crea un doc en /matches
 * con ID determinístico (uids ordenados unidos por "_") para evitar duplicados.
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Co-localizamos las funciones con Firestore (southamerica-east1) para
// minimizar latencia y costos de egress. maxInstances limita el costo
// ante picos inesperados de tráfico.
setGlobalOptions({
  region: "southamerica-east1",
  maxInstances: 10,
});

/**
 * Trigger: cada vez que se crea un doc en /swipes.
 *
 * Si el swipe es un "like" y la otra persona ya había dado "like" en el
 * sentido inverso, creamos /matches/{matchId} donde matchId = uids
 * ordenados unidos por "_". Usamos merge:true para que la operación sea
 * idempotente (si ambos usuarios likean al mismo tiempo, ambas
 * invocaciones terminan en el mismo doc final).
 */
exports.onSwipeCreated = onDocumentCreated("swipes/{swipeId}", async (event) => {
  const snap = event.data;
  if (!snap) return;
  const swipe = snap.data();

  // Validación defensiva.
  if (!swipe || !swipe.from || !swipe.to) {
    logger.warn("Swipe inválido — falta from o to", { swipeId: event.params.swipeId });
    return;
  }
  if (swipe.kind !== "like") return; // pass: no hace nada
  if (swipe.from === swipe.to) return; // self-swipe: ignorar

  // ¿Existe un like recíproco?
  const reciprocal = await db
    .collection("swipes")
    .where("from", "==", swipe.to)
    .where("to", "==", swipe.from)
    .where("kind", "==", "like")
    .limit(1)
    .get();

  if (reciprocal.empty) {
    logger.info(`Like de ${swipe.from} → ${swipe.to}: sin reciprocidad todavía`);
    return;
  }

  // ¡Match! Crear doc determinístico.
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

  logger.info(`Match creado: ${matchId}`);
});
