// Stand-ins de développement local (src/assets/standins/, non versionnés). Ce module n'est utile qu'en `astro dev` :
// pour tout build, le plugin « dvk-standins » (astro.config.mjs) le remplace par un objet vide, donc aucun fichier de stand-in
// ne peut être émis dans un site construit. Ne rien importer d'autre depuis ce dossier.
import type { ImageMetadata } from "astro";

const dossier = import.meta.glob<{ default: ImageMetadata }>("../assets/standins/*.{webp,jpg,jpeg,png,avif}", { eager: true });
export default dossier;
