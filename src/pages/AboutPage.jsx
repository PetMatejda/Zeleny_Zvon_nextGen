import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function AboutPage() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.slice(0, 3));
      })
      .catch(err => console.error(err));
  }, []);

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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
            <div className="md:col-span-5 relative sticky top-32">
              <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(15,30,12,0.06)]">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://be43f77103.clvaw-cdnwnd.com/7e020fcf408e821cb2e88418c25b9f42/200004532-b1326b132a/9X6A9899%20kopie%202-001px.jpeg?ph=be43f77103"
                  alt="Petra Matějíčková"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-secondary-container rounded-xl -z-10 opacity-30"></div>
            </div>
            <div className="md:col-span-7">
              <h2 className="text-4xl font-notoserif text-primary-container mb-8">Můj příběh</h2>
              <div className="space-y-6 text-lg leading-relaxed text-on-surface-variant font-plusjakarta">
                <p className="italic text-primary-container font-medium text-xl border-l-4 border-secondary pl-6 mb-8">
                    "Jsem obyčejná žena s nevšedními životními zkušenostmi. Nešetřila jsem se a život nešetřil mě. Poznala jsem úspěchy i pády. Měla jsem možnost projít mnoho světů."
                </p>
                <p>
                    Umělecký, akademický i krajinu sebepoznání. Překonala jsem hluboké trauma, poruchu příjmu potravy, vážné onemocnění i několik fatálních osobních a podnikatelských nezdarů. Měla jsem odvahu podívat se až na dno propasti, abych uviděla a pochopila své životní vzorce. A měla dostatek trpělivosti a sil, je uvolnit a změnit. Zpomalila jsem své životní tempo. V mnoha ohledech jsem měla neuvěřitelné štěstí. Život jde dál a já jdu konečně s ním. S plnou zodpovědností za sebe, své zdraví a s vědomím, že tělo a duše přirozeně touží po harmonii.
                </p>
                <p>
                    Ač jsem na gymnáziu zvažovala studium medicíny, na krásných 12 let jsem skončila na prknech, co znamenají svět. Byla jsem členkou různých muzikálových souborů a věnovala se múzickým uměním (Jesus Christ Superstar, HAIR, Drákula, Hrabě Monte Cristo, Les Miserábles, Miss Saigon). Roky jsem vstupovala do různých rolí, hrála a hrála si. S charaktery postav, s jejich hranicemi a sama se sebou. Souběžně s uměleckou dráhou jsem se od svých 18 let věnovala i pedagogické práci s dětmi v tanečním studiu DAG.
                </p>
                <p>
                    S tehdejším partnerem jsem založila a vedla kultovní pražskou kavárnu Dobrá Trafika. Po osobní krizi následoval úprk z města. Několik měsíců jsem prožila na chalupě v brdských lesích a pracovala v květinářství, kde jsem se naučila vázat květiny i pohřební věnce.
                </p>
                <p>
                    Uměleckou kariéru vystřídala role mateřská. V pokročilém stádiu těhotenství jsem si v roce 2004 splnila sen a byla jsem přijata na FF UK, obor Etnologie. Vedle mateřství jsem se věnovala kulturně-sociální antropologii... K certifikaci v metodě Pilates a učitelství Kundalini jógy jsem přidala i rekvalifikaci kuchaře a obhájila projekt holistického centra. Pokračovala jsem v cestách za poznáním psychoterapeutických přístupů, výživy a bylin.
                </p>
                <p>
                    Následoval dlouhý půst, obřad s amazonskou medicínou, týdenní pobyt ve tmě. Objevila jsem sílu dechu a schopnost sebeuzdravení. Přišel Covid a s ním spousta deziluzí a nečekaných ztrát. Pod tlakem událostí se rozpadla další nepotřebná přesvědčení, aby udělala místo pro nové. Zdravější, radostnější, pravdivější, svobodnější.
                </p>
                <p>
                    Zhmotnila jsem svůj sen a místo holistického centra jsem otevřela domácí holistické studio. Děkuji svým blízkým za podporu. Důvěrný vztah se sebou a s nimi je to nejcennější, co mám.
                </p>
                <p>
                    Ve své praxi naplno využívám svou plnou přítomnost, vnitřní klid, nabyté zkušenosti a poznání. Kombinuji různé techniky a přístupy směřující k jednotě těla, mysli a duše. Vytvářím prostor pro sebepéči, seberegulaci, sebeuzdravení. Nabízím rozmanité způsoby, jak objevit cestu ke zdraví, spokojenosti a rovnováze. Beze spěchu, bez tlaku, bez přílišného očekávání. S všímavostí, důvěrou, respektem, radostí a rezonancí. :-)
                </p>
                <div className="pt-8">
                  <span className="font-notoserif italic text-2xl text-[#765a17] dark:text-[#ffdf9f]">Petra Matějíčková</span>
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
                Propojujeme tradiční techniky s poznatky o neurovědě a zvukovém léčení pro dosažení nejlepších výsledků.
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

      {/* Our Products / Naše produkty */}
      <section className="py-32 bg-surface-container-low text-on-surface">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-4xl font-notoserif mb-4 text-primary-container">Kousek Zeleného Zvonu u vás doma</h2>
              <p className="text-on-surface-variant max-w-2xl leading-relaxed">V našich terapiích využíváme sílu čisté přírody. Tyto a mnoho dalších produktů sami každodenně používáme, a proto je nabízíme i vám, abyste si mohli vytvořit kousek naší atmosféry i u sebe doma.</p>
            </div>
            <div className="mt-8 md:mt-0">
              <Link to="/eshop" className="bg-primary-container text-on-primary px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all inline-block">
                Celá nabídka e-shopu
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {products.map(product => (
              <div key={product.id} className="group flex flex-col justify-between h-full">
                <div className="relative overflow-hidden rounded-xl bg-surface-container-high mb-4 aspect-[4/5] cursor-pointer">
                  <div className="block h-full w-full bg-surface-container-highest/30">
                    <img 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      src={product.image || 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=600'} 
                      onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=600'}
                    />
                  </div>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(product);
                    }}
                    className="absolute bottom-4 right-4 bg-surface-container-lowest/90 backdrop-blur-md p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110"
                  >
                    <span className="material-symbols-outlined text-primary-container">shopping_bag</span>
                  </button>
                </div>
                <div className="px-2 flex-grow flex flex-col justify-end">
                  <p className="text-[10px] uppercase tracking-widest text-[#765a17] dark:text-[#ffdf9f] font-bold mb-1">{product.category}</p>
                  <h3 className="text-lg font-notoserif text-on-surface leading-tight mb-2">
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center mt-auto pt-2">
                    <span className="text-lg font-semibold">{product.price?.toLocaleString('cs-CZ')} Kč</span>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                      }}
                      className="text-sm font-medium text-[#765a17] dark:text-[#ffdf9f] underline underline-offset-4 hover:text-primary-container transition-colors"
                    >
                      Vložit do košíku
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
                  <p className="text-on-surface-variant">Nad sadem 542/19<br/>Praha 10, 111 01</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-[#765a17] text-2xl">mail</span>
                <div>
                  <h4 className="font-notoserif text-lg">Napište nám</h4>
                  <p className="text-on-surface-variant">info@zelenyzvon.cz</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-[#765a17] text-2xl">call</span>
                <div>
                  <h4 className="font-notoserif text-lg">Zavolejte nám</h4>
                  <p className="text-on-surface-variant">+420 771 187 776</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
