import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>DVK Studio Blog</title>
    <description>Conseils en rénovation et valorisation immobilière dans l'Oise et la Somme</description>
    <link>https://dvkstudio.fr/blog/</link>
    <language>fr</language>
    <item>
      <title>Rénover une maison ancienne dans l'Oise et la Somme : le guide pour sécuriser ses travaux, son budget et ses aides en 2026</title>
      <link>https://dvkstudio.fr/blog/renover-maison-ancienne-oise-somme-guide-2026/</link>
      <description>Rénovez votre maison ancienne en Oise et Somme en sécurité : budget au m², aides 2026 et artisans audités.</description>
      <pubDate>Tue, 13 Oct 2026 08:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Rénovation d'une maison ancienne dans l'Oise : étapes, budget et pièges à éviter</title>
      <link>https://dvkstudio.fr/blog/renovation-maison-ancienne-oise/</link>
      <description>Étapes, budget et précautions pour rénover une maison ancienne en pierre ou brique dans l'Oise avec l'accompagnement hemea.</description>
      <pubDate>Mon, 12 Oct 2026 08:00:00 GMT</pubDate>
    </item>
    <item>
      <title>MaPrimeRénov' et rénovation d'ampleur dans l'Oise et la Somme</title>
      <link>https://dvkstudio.fr/blog/maprimerenov-renovation-ampleur-oise-somme/</link>
      <description>Guide complet des aides MaPrimeRénov' pour vos projets de rénovation énergétique d'ampleur.</description>
      <pubDate>Fri, 09 Oct 2026 08:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Rénovation d'une maison amiénoise dans la Somme</title>
      <link>https://dvkstudio.fr/blog/renovation-maison-amienoise-somme/</link>
      <description>Spécificités et accompagnement pour la rénovation d'une maison amiénoise typique.</description>
      <pubDate>Wed, 07 Oct 2026 08:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
