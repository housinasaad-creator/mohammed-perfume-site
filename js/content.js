/*
  كل نصوص الموقع هنا (إنجليزي + عربي). المحتوى كله مفترض للتجربة (علامة وهمية).
  الاتجاه ثابت من اليسار لليمين في اللغتين: الصفحة لا تنقلب، والعربي يُكتب ويُحاذى لليسار.
*/
window.CONTENT = {
  en: {
    lang: 'en',
    title: 'MOHAMMED · Maison de Parfum',
    brand: 'MOHAMMED',
    nav: { home: 'Home', collection: 'Collection', notes: 'Notes', craft: 'Craft', contact: 'Contact' },
    langBtn: 'العربية',
    bag: 'Bag',
    loader: 'Lighting the flame',
    chapters: [
      { k: 'MAISON DE PARFUM · EST. 2026', t: 'MOHAMMED', s: 'Where oud meets fire.', cta: 'Scroll to ignite' },
      { k: 'CHAPTER I', t: 'Born from fire', s: 'Smoked oud, cinnamon bark and ember amber, lit slowly and left to rise.' },
      { k: 'CHAPTER II', t: 'One full turn', s: 'Turn it, and the scent turns with you: the first spark, the warm heart, the long amber trail.' },
      { k: 'CHAPTER III', t: 'Crowned in gold', s: 'A hand-cut glass stopper and a brushed gold collar, sealed and numbered one by one.' },
      { k: 'CHAPTER IV', t: 'Settle into it', s: 'Twelve hours on skin. A quiet flame that never quite goes out.', cta: 'Explore the collection' }
    ],
    dots: ['Ignite', 'Rise', 'Turn', 'Crown', 'Settle'],
    collection: { k: 'THE COLLECTION', t: 'Six signatures, one flame.', s: 'Every bottle is a different way to wear the same fire.', add: 'Add to bag', added: 'Added', size: 'Eau de Parfum · 50 ml', top: 'Top', heart: 'Heart', base: 'Base' },
    notes: { k: 'THE NOTES', t: 'Three things we never compromise on.', items: [
      { t: 'Smoked Oud', d: 'Aged twelve years in clay vessels until the wood turns dark, sweet and resinous.', n: '01' },
      { t: 'Cinnamon Bark', d: 'Hand-peeled, dried over embers and ground fresh for every batch.', n: '02' },
      { t: 'Night Blossom', d: 'Petals picked before sunrise, so the flower stays soft against the smoke.', n: '03' }
    ] },
    craft: { k: 'THE CRAFT', t: 'Made slowly, by hand.', steps: [
      { n: '01', t: 'Harvest', d: 'Wood, bark and petals gathered in small lots.' },
      { n: '02', t: 'Distill', d: 'Copper stills, low flame, no shortcuts.' },
      { n: '03', t: 'Age', d: 'Months of rest until the notes fuse.' },
      { n: '04', t: 'Pour', d: 'Poured, sealed and numbered by hand.' }
    ] },
    voices: { k: 'VOICES', t: 'What they say after the first spray.', items: [
      { q: 'It smells like a fire at the edge of a desert night.', a: 'Nour A. · Dubai' },
      { q: 'Warm, dark and somehow clean. I get asked about it everywhere.', a: 'Karim S. · Istanbul' },
      { q: 'The cinnamon is unreal. Twelve hours later it is still there.', a: 'Lina M. · Berlin' }
    ] },
    contact: { k: 'STAY CLOSE', t: 'Be first to the next batch.', s: 'One email when a new fragrance is poured. Nothing else.', ph: 'Your email', btn: 'Notify me', thanks: 'Thank you. This is a concept demo, nothing was sent.' },
    footer: { made: 'Designed & developed by Muhammed Elhuseyin', concept: 'Concept project: fictional brand, products and reviews.', rights: '© 2026 Mohammed Maison de Parfum (concept)' },
    products: [
      { id: 'ember', name: 'Ember Oud', tag: 'Signature', price: 145, top: 'Cinnamon', heart: 'Smoked oud', base: 'Amber', d: 'The flame itself: dark oud wrapped in warm cinnamon and a slow amber glow.' },
      { id: 'noir', name: 'Cinnamon Noir', tag: 'Night', price: 130, top: 'Black pepper', heart: 'Cinnamon bark', base: 'Tonka', d: 'Spiced and matte-black: cinnamon sharpened with pepper, softened by tonka.' },
      { id: 'rose', name: 'Rose Saffron', tag: 'Floral', price: 150, top: 'Saffron', heart: 'Damask rose', base: 'White musk', d: 'A rose lit from underneath, saffron threads glowing through petals.' },
      { id: 'veil', name: 'Amber Veil', tag: 'Soft', price: 125, top: 'Vanilla', heart: 'Amber', base: 'Sandalwood', d: 'Honeyed amber drawn like a veil over creamy sandalwood.' },
      { id: 'musk', name: 'Midnight Musk', tag: 'Clean', price: 135, top: 'Iris', heart: 'White musk', base: 'Cedar', d: 'Cool, smooth and nocturnal: iris and musk over dry cedar.' },
      { id: 'dunes', name: 'Golden Dunes', tag: 'Warm', price: 140, top: 'Cardamom', heart: 'Honey', base: 'Frankincense', d: 'Frankincense smoke drifting over honeyed cardamom, like sand at dusk.' }
    ]
  },

  ar: {
    lang: 'ar',
    title: 'محمد · دار العطور',
    brand: 'محمد',
    nav: { home: 'الرئيسية', collection: 'المجموعة', notes: 'المكوّنات', craft: 'الصنعة', contact: 'تواصل' },
    langBtn: 'English',
    bag: 'الحقيبة',
    loader: 'نُشعل اللهب',
    chapters: [
      { k: 'دار العطور · منذ ٢٠٢٦', t: 'محمد', s: 'حيث يلتقي العود بالنار.', cta: 'مرّر لتشتعل' },
      { k: 'الفصل الأول', t: 'وُلد من النار', s: 'عود مدخّن ولحاء القرفة وعنبر الجمر، يشتعل ببطء ويرتفع بهدوء.' },
      { k: 'الفصل الثاني', t: 'دورة كاملة', s: 'أدِرْه فيدور العطر معك: الشرارة الأولى، والقلب الدافئ، وأثر العنبر الطويل.' },
      { k: 'الفصل الثالث', t: 'متوّج بالذهب', s: 'سدادة زجاج مقطوعة يدوياً وطوق ذهبي مصقول، تُختم وتُرقَّم واحدة واحدة.' },
      { k: 'الفصل الرابع', t: 'استقر فيه', s: 'اثنتا عشرة ساعة على البشرة. لهب هادئ لا ينطفئ تماماً.', cta: 'اكتشف المجموعة' }
    ],
    dots: ['اشتعال', 'ارتفاع', 'دوران', 'تاج', 'استقرار'],
    collection: { k: 'المجموعة', t: 'ست بصمات، ولهبٌ واحد.', s: 'كل زجاجة طريقة مختلفة لارتداء النار نفسها.', add: 'أضف إلى الحقيبة', added: 'أُضيف', size: 'ماء عطر · ٥٠ مل', top: 'الافتتاحية', heart: 'القلب', base: 'القاعدة' },
    notes: { k: 'المكوّنات', t: 'ثلاثة أشياء لا نساوم عليها.', items: [
      { t: 'العود المدخّن', d: 'معتّق اثنتي عشرة سنة في أوانٍ فخارية حتى يصير الخشب داكناً حلواً راتنجياً.', n: '٠١' },
      { t: 'لحاء القرفة', d: 'يُقشَّر يدوياً ويُجفَّف على الجمر ويُطحن طازجاً لكل دفعة.', n: '٠٢' },
      { t: 'زهر الليل', d: 'بتلات تُقطف قبل الشروق لتبقى الزهرة ناعمة أمام الدخان.', n: '٠٣' }
    ] },
    craft: { k: 'الصنعة', t: 'يُصنع ببطء وباليد.', steps: [
      { n: '٠١', t: 'الحصاد', d: 'خشب ولحاء وبتلات تُجمع بدفعات صغيرة.' },
      { n: '٠٢', t: 'التقطير', d: 'قدور نحاسية ولهب هادئ بلا اختصارات.' },
      { n: '٠٣', t: 'التعتيق', d: 'أشهر من الراحة حتى تندمج النوتات.' },
      { n: '٠٤', t: 'التعبئة', d: 'تُسكب وتُختم وتُرقَّم باليد.' }
    ] },
    voices: { k: 'آراء', t: 'ماذا يقولون بعد أول رشّة.', items: [
      { q: 'رائحته كنار على حافة ليلة صحراوية.', a: 'نور أ. · دبي' },
      { q: 'دافئ وداكن ونظيف بطريقة غريبة. يسألونني عنه في كل مكان.', a: 'كريم س. · إسطنبول' },
      { q: 'القرفة لا تُصدَّق. بعد اثنتي عشرة ساعة ما زالت موجودة.', a: 'لينا م. · برلين' }
    ] },
    contact: { k: 'ابقَ قريباً', t: 'كن أول من يعرف الدفعة القادمة.', s: 'رسالة واحدة عند صبّ عطر جديد. لا شيء غيرها.', ph: 'بريدك الإلكتروني', btn: 'أخبرني', thanks: 'شكراً. هذا عرض تجريبي ولم يُرسل شيء.' },
    footer: { made: 'تصميم وتطوير محمد الحسين', concept: 'مشروع تجريبي: علامة ومنتجات وآراء مفترضة.', rights: '© ٢٠٢٦ محمد دار العطور (تجريبي)' },
    products: [
      { id: 'ember', name: 'عود الجمر', tag: 'التوقيع', price: 145, top: 'قرفة', heart: 'عود مدخّن', base: 'عنبر', d: 'اللهب نفسه: عود داكن تلفّه قرفة دافئة ووهج عنبر بطيء.' },
      { id: 'noir', name: 'قرفة نوار', tag: 'الليل', price: 130, top: 'فلفل أسود', heart: 'لحاء القرفة', base: 'تونكا', d: 'متبّل وأسود مطفي: قرفة يحدّها الفلفل وتلطّفها التونكا.' },
      { id: 'rose', name: 'ورد وزعفران', tag: 'زهري', price: 150, top: 'زعفران', heart: 'ورد دمشقي', base: 'مسك أبيض', d: 'وردة مضاءة من الأسفل وخيوط زعفران تتوهج بين البتلات.' },
      { id: 'veil', name: 'ستار العنبر', tag: 'ناعم', price: 125, top: 'فانيلا', heart: 'عنبر', base: 'صندل', d: 'عنبر عسلي ينسدل كستار فوق صندل كريمي.' },
      { id: 'musk', name: 'مسك منتصف الليل', tag: 'نقي', price: 135, top: 'سوسن', heart: 'مسك أبيض', base: 'أرز', d: 'بارد وناعم وليلي: سوسن ومسك فوق أرز جاف.' },
      { id: 'dunes', name: 'كثبان ذهبية', tag: 'دافئ', price: 140, top: 'هيل', heart: 'عسل', base: 'لبان', d: 'دخان اللبان يتهادى فوق هيل عسلي كرمل عند الغروب.' }
    ]
  }
};
