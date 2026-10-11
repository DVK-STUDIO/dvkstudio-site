import assert from "node:assert/strict";
import { signalConversion } from "../src/lib/conversion.mjs";
assert.deepEqual(signalConversion("rdv_ouvert", "professionnels", "hero.partenariat"), { evenement:"rdv_ouvert", page:"professionnels", bouton:"hero.partenariat" });
assert.equal(signalConversion("rdv_reserve", "home"), null, "Un clic ne confirme jamais une réservation");
assert.equal(signalConversion("email_envoye", "home"), null, "Un mailto ne confirme jamais un envoi");
assert.equal(signalConversion("page_vue", "page-inconnue"), null);
assert.deepEqual(signalConversion("rdv_ouvert", "home", "personne@example.com"), { evenement:"rdv_ouvert", page:"home" }, "Aucune donnée libre dans le signal");
console.log("Conversion : 5 vérifications réussies.");
