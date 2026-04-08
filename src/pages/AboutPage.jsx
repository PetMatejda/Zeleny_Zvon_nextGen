import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <main className="font-plusjakarta">
      {/* Hero Section */}
      <section className="relative min-h-[716px] flex items-center overflow-hidden py-24">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuARzGr1VHVYBhYYbuTuQByKGcNxr862gIrjJ4a9Rapf9LVTVRR_tiKFMdbC816xcg6z8OwOAGsqfJR7KC5Vq1ejrJUAXq8ilm_SxlsJlqOKkce7ZtoSYOoMMpakiOnqz0ZOydh3p4JaW1kUwW7UE9ofMw-cFCYc589Arvk6-sh1mKrRTsO027yIotyv0V_GhVwfPtf9PEMrRzW-ifOgYlyp6BS7VxwdZ5UkcOhiuQh0j9D-ECw2qhcIdHYt1a9oY5EipWpifx9DwXU"
            alt="interior of a minimalist wellness studio"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
          <div className="max-w-2xl">
            <span className="inline-block py-1 px-4 mb-6 rounded-full bg-secondary-fixed text-on-secondary-fixed text-sm font-semibold tracking-widest uppercase font-plusjakarta">O nás</span>
            <h1 className="text-6xl md:text-7xl font-notoserif leading-tight text-primary-container mb-8">Hledání vnitřní rezonance</h1>
            <p className="text-xl font-plusjakarta leading-relaxed text-on-surface-variant max-w-xl">
                Zelený Zvon není jen studio. Je to prostor, kde se čas zpomaluje a kde každý zvuk, vůně a dotek mají svůj hluboký význam.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story / Náš příběh */}
      <section className="py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
            <div className="md:col-span-5 relative">
              <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(15,30,12,0.06)]">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4Lc5oUAwq_QbX1gXEhRGvOplfVJUc5rRTK1tqoRpY0lnl7S83ofjVBBd-GuKIzvIITAyAivXchqQoio24hdGRo8Hcyl47xKdN_4_ZWn8MM3vxqHqmcm5oWEyycMQkOVPsu3egimkUsTBlxumElXbekmCxkgRtXGEa5PWB1EFNIr8OhNxnpjFOZaqK5D5HZxDIZ2_9MfvEAfQwuvc07Hfkxa0hOdPbjn8chwJPeqi2Tl3nHItvYaUaKFzs7pJdD4ySdj9x5C65Tks"
                  alt="portrait of a serene woman"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-secondary-container rounded-xl -z-10 opacity-30"></div>
            </div>
            <div className="md:col-span-7">
              <h2 className="text-4xl font-notoserif text-primary-container mb-8">Náš příběh</h2>
              <div className="space-y-6 text-lg leading-relaxed text-on-surface-variant font-plusjakarta">
                <p className="italic text-primary-container font-medium text-xl border-l-4 border-secondary pl-6 mb-8">
                    "Zelený Zvon vznikl z ticha. Z potřeby najít místo, které by rezonovalo s přírodou i naší duší ve světě, který je příliš hlasitý."
                </p>
                <p>
                    Jmenuji se Klára a mou vizí bylo vytvořit útočiště, kde se moderní terapie potkává s tisíciletou moudrostí. Věřím, že každý z nás nese svůj vlastní 'zvon' – vnitřní harmonii, která se občas vychýlí z rytmu.
                </p>
                <p>
                    Moje cesta začala studiem bylinek v podhůří a pokračovala přes certifikace v holistických terapiích až k otevření tohoto prostoru. Zelený Zvon je vyjádřením mé lásky k zemi a k lidskému potenciálu uzdravit se skrze klid.
                </p>
                <div className="pt-8">
                  <span className="font-notoserif italic text-2xl text-[#765a17] dark:text-[#ffdf9f]">Klára Novotná</span>
                  <p className="text-sm font-plusjakarta text-on-surface-variant opacity-60">Zakladatelka & Terapeutka</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision and Values / Naše vize a hodnoty */}
      <section className="py-32 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8 text-center mb-20">
          <h2 className="text-4xl font-notoserif text-primary-container mb-4">Vize & Hodnoty</h2>
          <div className="h-1 w-24 bg-[#765a17] dark:bg-[#ffdf9f] mx-auto"></div>
        </div>
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Value 1 */}
          <div className="bg-surface p-12 rounded-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(15,30,12,0.04)]">
            <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center text-on-primary mb-8">
              <span className="material-symbols-outlined text-3xl">nature_people</span>
            </div>
            <h3 className="text-2xl font-notoserif mb-4 text-on-surface">Autenticita</h3>
            <p className="text-on-surface-variant leading-relaxed">
                Nepoužíváme zkratky. Naše produkty jsou čisté, naše terapie upřímné a náš přístup vždy lidský a osobní.
            </p>
          </div>
          {/* Value 2 */}
          <div className="bg-surface p-12 rounded-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(15,30,12,0.04)]">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-on-secondary mb-8">
              <span className="material-symbols-outlined text-3xl">eco</span>
            </div>
            <h3 className="text-2xl font-notoserif mb-4 text-on-surface">Udržitelnost</h3>
            <p className="text-on-surface-variant leading-relaxed">
                Respektujeme cykly přírody. Vše, co děláme, je s ohledem na dlouhodobé zdraví planety i našich klientů.
            </p>
          </div>
          {/* Value 3 */}
          <div className="bg-surface p-12 rounded-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40_rgba(15,30,12,0.04)]">
            <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center text-primary-container mb-8">
              <span className="material-symbols-outlined text-3xl text-on-surface">auto_awesome</span>
            </div>
            <h3 className="text-2xl font-notoserif mb-4 text-on-surface">Inovace</h3>
            <p className="text-on-surface-variant leading-relaxed">
                Propojujeme tradiční techniky s novými poznatky o neurovědě a zvukovém léčení pro dosažení nejlepších výsledků.
            </p>
          </div>
        </div>
      </section>

      {/* Atmosphere / Studio Space */}
      <section className="py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-notoserif text-primary-container mb-8">Atmosféra ticha</h2>
              <p className="text-lg text-on-surface-variant mb-8 leading-relaxed font-plusjakarta">
                  Náš prostor byl navržen jako rezonanční tělo. Použili jsme přírodní materiály jako hlínu, dubové dřevo a len, abychom vytvořili akusticky i vizuálně klidné prostředí.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-6 rounded-xl">
                  <span className="text-3xl font-notoserif text-[#765a17] dark:text-[#ffdf9f] block mb-2">24°C</span>
                  <span className="text-sm uppercase tracking-widest font-semibold opacity-60 text-on-surface">Ideální teplota</span>
                </div>
                <div className="bg-surface-container-low p-6 rounded-xl">
                  <span className="text-3xl font-notoserif text-[#765a17] dark:text-[#ffdf9f] block mb-2">432Hz</span>
                  <span className="text-sm uppercase tracking-widest font-semibold opacity-60 text-on-surface">Léčivá frekvence</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6 pt-12">
                <div className="rounded-xl overflow-hidden h-64">
                  <img 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWJ0vQdbqcNXMKAF20fMW34dPMscr55Y-qkKtoLr-JKz6K1C6xPeQmBAHfmoRg7B0VUQ7T3lA6HrpxDPwdj0kMBX7YjqvZgsHTCstyfliglJzUC2g9nzcEiqnOWaG6WUDA239zl8fd-w09ciTNIdgNkoCdHHpVjEsne1yHNyCOgKUoFfEXu2WXcjV2nRo7SsjnSgWDneR2lv-oX2E3x4x7TkeB9jEldibsGYeSBbLoTWZ_OQ7P-UUS2C7894ExhzaLad4aJ8-hDUg"
                    alt="singing bowl"
                  />
                </div>
                <div className="rounded-xl overflow-hidden h-80">
                  <img 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgfyeQuUAriVkj5TWEsjSE5fO9sP9M7K9rHmAvUOLfm2e3YH7mGKD9UzjV4s45u72FMvYiP8rtMeIxqHxP5SlN14crWSfU4Rw04_6XgFMEkfORrVBjs4iAyiJM7LsxeoroDNDCD3LANy7K7wuO1FvdSlOPUZJSlP-1APPKYsEJ3Hpdw88Y6zuU75sCHYSbSjd6LEYQv2vwwh7AwpjL-kdIx2IIvqEUA0kCGQh8ZrnL7jL8NY0atSadBSrI2eFqRXxOTQkRARuIQHg"
                    alt="meditation corner"
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div className="rounded-xl overflow-hidden h-80">
                  <img 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdNm67yXh89A8UEXcZnWHb9SKlN8m2VEpHX7dNYufbJkgUC8RxlVhhavfjYepb89dBE1L3rzLL-9yM-Hy9EcZs5wxbbWkJlnaW3SwWz3LGkRGDjN-6ApaDqRGKrH7Q7GHCw28inX_k5Y5iaRwneWrLPdO57ow15_TcTPzDd3RyzbH3DPOWXosN4DQI8Qo33Aiunhp9VGzYAMK7YLD32eByZKepzKHmwVBFU2-Szr6GGlwd8SGTbtKF4oYo1NPgwA4EiAXakzn3xBM"
                    alt="therapy room"
                  />
                </div>
                <div className="rounded-xl overflow-hidden h-64">
                  <img 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBH8NjN1bjjMKJ2SJAlZnWS6jNdIQVBBrAcGurOUejQf5CC1KdTFNBdmJDDlOIgqPt4UsoHdARlugkcH5YP9e0RPj4BOZykNZvlfMFj3Ae8yPhniLYl-gk5VhedWcJ4hlCS6hjwuzszQsOpDu-5LEuRM9fySlrJEzOHpMWM36XNFY0fWCC6jPCn18LnRVB8PI8kUwCRJkdm8_MWd0YWYLBsL9YLOkQf37RmLlfHyglc1mc3MOE5PjRGJiRsQE_RHFT-GLVc7LkeRfc"
                    alt="architectural detail"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team / Náš tým */}
      <section className="py-32 bg-primary-container text-on-primary">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-4xl font-notoserif mb-4 text-[#faf9f4]">Náš tým</h2>
              <p className="text-on-primary-container max-w-lg">Průvodci na vaší cestě k harmonii. Každý z nás přináší unikátní pohled a specializaci.</p>
            </div>
            <div className="mt-8 md:mt-0">
              <button className="bg-secondary-fixed text-on-secondary-fixed px-8 py-4 rounded-full font-semibold hover:bg-secondary-fixed-dim transition-colors">Přidejte se k nám</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Team Member 1 */}
            <div className="group">
              <div className="relative mb-6 overflow-hidden rounded-xl aspect-square">
                <img 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLsa2vhr6WytHlsqYaU4yOv6sgSYYZQQei9o70MyE3H0DuIMJ_76nRpt9K3vsS7y22-dpewAtjD7i-I0thWkcF2Y6c96Rfyv7KVTRP6cAdetbBL5_O9oo7ZWSld58QqgpsBRHAe9uPQXXt1-Ds6_RaWX5Vk5C2OLE2EonLrQopT3BkglPs56y7GDn5_vVIzTVGZQl0UYuAoAy1WCoYyJslw8UtZbi3PrMYFsYz6H4ipLvxiwtEWDZEIjOjHrajPnGhuWno-jfsJMM"
                  alt="Klára Novotná"
                />
                <div className="absolute inset-0 bg-[#765a17]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <h3 className="text-2xl font-notoserif mb-1 text-[#faf9f4]">Klára Novotná</h3>
              <p className="text-on-primary-container font-plusjakarta uppercase tracking-widest text-xs mb-4">Founder & Sound Healer</p>
              <p className="text-sm opacity-80 leading-relaxed text-[#faf9f4]">Expertka na vibrační medicínu a fytoterapii s 15letou praxí v oboru holistického zdraví.</p>
            </div>
            {/* Team Member 2 */}
            <div className="group">
              <div className="relative mb-6 overflow-hidden rounded-xl aspect-square">
                <img 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-NrF7_KzigsUuYg6rDSNvRsHB4fiiXxsFiCJWjkqwBoANWJ6t30Kb9zAgNzriiQLDp9Y9OgwwccxQTT-i9v1hj5vVW8yPt0CX7XTRWjkFiHdjFpmvTi2dDH8xS8uI4GB42j7NPPAommVvdBPuuRg6GlFvO9wErCPVq3KV7I1RBd6GuPG3N6gRlAOwhwsHwDYJpEMTb1lRRhaeM3KB3iCtL4kFeoLz1YHrzJH-HOeviK46wKfRBDP5Q86zwgjodhhMXpfQ_Gvt-4M"
                  alt="Tomáš Bareš"
                />
                <div className="absolute inset-0 bg-[#765a17]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <h3 className="text-2xl font-notoserif mb-1 text-[#faf9f4]">Tomáš Bareš</h3>
              <p className="text-on-primary-container font-plusjakarta uppercase tracking-widest text-xs mb-4">Breathwork Coach</p>
              <p className="text-sm opacity-80 leading-relaxed text-[#faf9f4]">Specialista na dechové techniky a mindfulness, který vám pomůže ovládnout stres v každodenním životě.</p>
            </div>
            {/* Team Member 3 */}
            <div className="group">
              <div className="relative mb-6 overflow-hidden rounded-xl aspect-square">
                <img 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6I40sDxqnAkoaRYTs7_XYc_GWPxXJXUNSm_wWPZNs1bDwjuPgYT-EHo_0UrK47zF_QViA57kbKFuCC8U0vgyzBz5cUyzguhB0-dDZvMQRHqcFjtEciMfcvC0_-rW9RE493no9ReDlcdHQOXD6P4HpKhVP16QkhA9xwZo6r8EdKrAg5HrHk4dW_Z1m5NG2BewSTof8skUCFzXcX8yytnsE35n2PFIHui52rPQARGdbYvRbub1uMQCEBmyxSQg5U6eCyB8lJgiFpNU"
                  alt="Eliška Malá"
                />
                <div className="absolute inset-0 bg-[#765a17]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <h3 className="text-2xl font-notoserif mb-1 text-[#faf9f4]">Eliška Malá</h3>
              <p className="text-on-primary-container font-plusjakarta uppercase tracking-widest text-xs mb-4">Movement Specialist</p>
              <p className="text-sm opacity-80 leading-relaxed text-[#faf9f4]">Její lekce jógy a somatického pohybu jsou navrženy tak, aby obnovily plynulost a lehkost vašeho těla.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA & Contact */}
      <section className="py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-8">
          <div className="bg-surface-container-low rounded-xl p-12 md:p-24 flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="text-5xl font-notoserif text-primary-container mb-6">Začněte svou cestu ještě dnes</h2>
              <p className="text-xl text-on-surface-variant mb-10 font-plusjakarta leading-relaxed">
                  Rádi vás uvidíme u nás ve studiu v srdci Prahy. Zastavte se na čaj nebo si rezervujte svou první konzultaci.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link className="bg-primary-container text-on-primary px-10 py-5 rounded-full font-semibold text-lg hover:shadow-xl transition-all inline-block" to="/contact">
                   Rezervovat sezení
                </Link>
                <Link className="bg-white border border-outline-variant text-primary-container px-10 py-5 rounded-full font-semibold text-lg hover:bg-surface-container-high transition-all" to="/services">
                   Naše služby
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/3 space-y-8 text-on-surface">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-[#765a17] text-2xl">location_on</span>
                <div>
                  <h4 className="font-notoserif text-lg">Kde nás najdete</h4>
                  <p className="text-on-surface-variant">Rezidenční čtvrť, Zvonná 12<br/>Praha 1, 110 00</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-[#765a17] text-2xl">mail</span>
                <div>
                  <h4 className="font-notoserif text-lg">Napište nám</h4>
                  <p className="text-on-surface-variant">ahoj@zelenyzvon.cz</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-[#765a17] text-2xl">schedule</span>
                <div>
                  <h4 className="font-notoserif text-lg">Otevírací doba</h4>
                  <p className="text-on-surface-variant">Po - Pá: 08:00 - 20:00<br/>So: 09:00 - 15:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
