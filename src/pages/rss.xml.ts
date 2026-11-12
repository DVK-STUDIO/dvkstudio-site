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
      <title>Visiter une maison ancienne dans l'Oise ou la Somme : ce qu'il faut vérifier avant de faire une offre</title>
      <link>https://dvkstudio.fr/blog/premiere-visite-maison-ancienne-oise-somme/</link>
      <description>Humidité, charpente, électricité, réseaux : ce qu'il faut regarder lors de la visite d'une maison ancienne dans l'Oise et la Somme avant de faire une offre.</description>
      <pubDate>Thu, 12 Nov 2026 08:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Votre budget travaux prévoit-il une réserve pour imprévus ? Le guide pour les investisseurs et propriétaires</title>
      <link>https://dvkstudio.fr/blog/reserve-imprevus-budget-travaux-renovation/</link>
      <description>Pourquoi prévoir une réserve pour imprévus dans un budget de rénovation de bâti ancien, comment la construire et la séparer des devis. Oise et Somme.</description>
      <pubDate>Thu, 12 Nov 2026 08:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Ouvrir sa cuisine sur le salon : ce qu'il faut vérifier avant d'abattre une cloison</title>
      <link>https://dvkstudio.fr/blog/abattre-cloison-ouvrir-cuisine-mur-porteur/</link>
      <description>Ouvrir sa cuisine sur le salon : mur porteur ou non, réseaux cachés, autorisations en copropriété. Les vérifications avant d'abattre une cloison.</description>
      <pubDate>Thu, 12 Nov 2026 08:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Courtiers en crédit : comment un volet travaux bien cadré débloque le dossier de vos emprunteurs</title>
      <link>https://dvkstudio.fr/blog/courtiers-volet-travaux-dossier-pret-immobilier/</link>
      <description>Courtiers de l'Oise et de la Somme : comment un volet travaux bien cadré (enveloppe, devis détaillés, éco-PTZ) accélère le dossier de financement de vos emprunteurs.</description>
      <pubDate>Thu, 12 Nov 2026 08:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Remplacement de chauffage et aides France Rénov' en 2026 : le guide pour l'Oise et la Somme</title>
      <link>https://dvkstudio.fr/blog/remplacement-chauffage-pompe-a-chaleur-aides-oise-somme/</link>
      <description>Barèmes MaPrimeRénov' 2026, primes CEE, spécificités du bâti picard et cadre sécurisé hemea pour financer et réussir l'installation de votre pompe à chaleur.</description>
      <pubDate>Sat, 17 Oct 2026 08:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Rénover une maison ancienne dans l'Oise et la Somme : prix au m², étapes et aides en 2026</title>
      <link>https://dvkstudio.fr/blog/renover-maison-ancienne-oise-somme-guide-2026/</link>
      <description>Prix au m², ordre des travaux, isolation du bâti picard et aides 2026 pour rénover une maison ancienne dans l'Oise et la Somme.</description>
      <pubDate>Tue, 13 Oct 2026 08:00:00 GMT</pubDate>
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
