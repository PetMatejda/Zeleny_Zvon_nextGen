/**
 * Packeta (Zásilkovna) SOAP API helper
 * Dokumentace: https://docs.packeta.com/cs/docs/api/soap
 * Endpoint: https://www.zasilkovna.cz/api/rest
 */

const PACKETA_API_URL = 'https://www.zasilkovna.cz/api/rest';
const PACKETA_LABEL_BASE = 'https://www.zasilkovna.cz/api/v5';

function getApiPassword() {
  const pw = process.env.PACKETA_API_PASSWORD;
  if (!pw) throw new Error('PACKETA_API_PASSWORD není nastaveno v .env');
  return pw;
}

function getSenderName() {
  return process.env.PACKETA_SENDER_NAME || 'zelenyzvon';
}

function getDefaultWeight() {
  const w = parseFloat(process.env.PACKETA_DEFAULT_WEIGHT || '1');
  return isNaN(w) || w <= 0 ? 1 : w;
}

/**
 * Zavolá Packeta SOAP API a vrátí parsovanou XML odpověď jako text.
 */
async function callPacketaApi(xmlBody) {
  const response = await fetch(PACKETA_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    body: xmlBody,
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Packeta API HTTP error ${response.status}: ${text}`);
  }
  return text;
}

/**
 * Vytvoří zásilku v Zásilkovně.
 * @param {Object} order - Objekt objednávky z DB
 * @returns {Promise<{barcode: string, packetId: string}>}
 */
export async function createPacketaShipment(order) {
  const apiPassword = getApiPassword();
  const eshop = getSenderName();
  const weight = getDefaultWeight();
  const amountInCzk = (Number(order.totalAmount) / 100).toFixed(2);

  // Rozdělení jména na jméno + příjmení (best-effort)
  const nameParts = (order.customerName || '').trim().split(/\s+/);
  const firstName = nameParts[0] || 'Zákazník';
  const lastName = nameParts.slice(1).join(' ') || '-';

  let addressFields = '';
  let addressId = '';

  if (order.shippingMethod === 'packeta_zbox') {
    // Výdejní místo / Z-BOX — použije addressId = ID pobočky
    if (!order.packetaPointId) throw new Error('Chybí packetaPointId pro Z-BOX zásilku');
    addressId = `<addressId>${escapeXml(String(order.packetaPointId))}</addressId>`;
  } else if (order.shippingMethod === 'home_delivery') {
    // Doručení domů — parsujeme adresu
    const addr = order.deliveryAddress || order.address || '';
    // Packeta Home Delivery CZ = addressId pro domácí doručení Zásilkovny = "131" (HD CZ)
    // Viz https://docs.packeta.com/cs/docs/api/soap/carriers
    addressId = `<addressId>131</addressId>`;
    // Parsování adresy: očekáváme formát "Ulice 12, 120 00 Praha" nebo ruční pole
    const parts = addr.split(',').map(s => s.trim());
    const streetLine = parts[0] || '';
    const streetMatch = streetLine.match(/^(.*?)\s+(\d+[\w/]*)\s*$/);
    const street = streetMatch ? streetMatch[1] : streetLine;
    const houseNumber = streetMatch ? streetMatch[2] : '';
    const rest = parts.slice(1).join(', ');
    const zipMatch = rest.match(/(\d{3}\s?\d{2})/);
    const zip = zipMatch ? zipMatch[1].replace(/\s/, '') : '';
    const city = rest.replace(/\d{3}\s?\d{2}/, '').replace(/,/g, '').trim();

    addressFields = `
    <street>${escapeXml(street)}</street>
    <houseNumber>${escapeXml(houseNumber)}</houseNumber>
    <city>${escapeXml(city)}</city>
    <zip>${escapeXml(zip)}</zip>`;
  }

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<createPacket>
  <apiPassword>${escapeXml(apiPassword)}</apiPassword>
  <packetAttributes>
    <number>${escapeXml(String(order.id))}</number>
    <name>${escapeXml(firstName)}</name>
    <surname>${escapeXml(lastName)}</surname>
    <email>${escapeXml(order.email || '')}</email>
    ${addressId}
    <weight>${weight}</weight>
    <value>${amountInCzk}</value>
    <currency>CZK</currency>
    <eshop>${escapeXml(eshop)}</eshop>${addressFields}
  </packetAttributes>
</createPacket>`;

  const responseText = await callPacketaApi(xml);

  // Parsování odpovědi
  if (responseText.includes('<createPacketResult>')) {
    const barcodeMatch = responseText.match(/<barcode>([^<]+)<\/barcode>/);
    const idMatch = responseText.match(/<id>([^<]+)<\/id>/);
    if (!barcodeMatch) throw new Error('Packeta nevrátila barcode v odpovědi: ' + responseText);
    return {
      barcode: barcodeMatch[1],
      packetId: idMatch ? idMatch[1] : barcodeMatch[1],
    };
  }

  // Chybová odpověď
  const faultMatch = responseText.match(/<faultstring>([^<]+)<\/faultstring>/);
  const attrFault = responseText.match(/<attribute>([^<]+)<\/attribute>/);
  const errMsg = faultMatch ? faultMatch[1] : responseText.substring(0, 500);
  const attrInfo = attrFault ? ` (atribut: ${attrFault[1]})` : '';
  throw new Error(`Packeta chyba při vytváření zásilky: ${errMsg}${attrInfo}`);
}

/**
 * Zruší zásilku v Zásilkovně podle barcode.
 * @param {string} barcode
 * @returns {Promise<void>}
 */
export async function cancelPacketaShipment(barcode) {
  const apiPassword = getApiPassword();

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<cancelPacket>
  <apiPassword>${escapeXml(apiPassword)}</apiPassword>
  <packetId>${escapeXml(String(barcode))}</packetId>
</cancelPacket>`;

  const responseText = await callPacketaApi(xml);

  if (!responseText.includes('<cancelPacketResult>') && !responseText.includes('<status>ok</status>')) {
    const faultMatch = responseText.match(/<faultstring>([^<]+)<\/faultstring>/);
    const errMsg = faultMatch ? faultMatch[1] : responseText.substring(0, 300);
    // Logujeme chybu, ale netváříme se jako fatální (zásilka mohla být již zrušena)
    console.warn(`Packeta zrušení zásilky selhalo pro barcode ${barcode}: ${errMsg}`);
  }
}

/**
 * Vrátí URL pro stažení PDF štítku zásilky.
 * @param {string} barcode
 * @returns {string}
 */
export function getBarcodeLabelUrl(barcode) {
  const apiPassword = process.env.PACKETA_API_PASSWORD;
  if (!apiPassword) return null;
  return `${PACKETA_LABEL_BASE}/${apiPassword}/label/${barcode}/A6.pdf`;
}

/** Escapuje XML speciální znaky */
function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
