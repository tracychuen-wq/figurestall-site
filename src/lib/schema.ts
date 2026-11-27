import site from '../data/site.json';
const S: any = site;

export function businessSchema(base: string) {
  const s: any = {
    '@context': 'https://schema.org',
    '@type': S.businessType?.length ? S.businessType : 'LocalBusiness',
    '@id': base + '#business',
    name: site.name,
    alternateName: [site.legalName, S.brandShort, ...(S.brandAlt || [])].filter(Boolean),
    description: site.description,
    slogan: site.slogan,
    url: base,
    logo: /^https?:/.test(site.logoSquare) ? site.logoSquare : base.replace(/\/$/, '') + site.logoSquare,
    image: /^https?:/.test(site.ogImage) ? site.ogImage : base.replace(/\/$/, '') + site.ogImage,
    telephone: site.phoneRaw,
    founder: S.ownerName ? { '@type': 'Person', name: S.ownerName, alternateName: S.ownerNick || undefined } : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.district,
      addressRegion: site.address.city,
      postalCode: site.address.postalCode,
      addressCountry: 'TW',
    },
    areaServed: site.areas.map((a: string) => ({ '@type': 'AdministrativeArea', name: a })),
    hasMap: site.mapUrl,
    knowsAbout: S.knowsAbout || [],
    sameAs: [...Object.values((site as any).social || {}), site.lineUrl].filter(Boolean),
    contactPoint: { '@type': 'ContactPoint', telephone: site.phoneRaw, contactType: 'customer service', areaServed: 'TW', availableLanguage: ['zh-TW'] },
  };
  if (site.geo?.lat && site.geo?.lng) s.geo = { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng };
  return s;
}

export function breadcrumb(base: string, items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: new URL(it.path, base).toString() })),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}
