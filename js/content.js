/*
  كل نصوص الموقع هنا (إنجليزي + عربي). المحتوى كله مفترض للتجربة (علامة وهمية)، والدفع تجريبي بالكامل.
  الاتجاه ثابت من اليسار لليمين في اللغتين: الصفحة لا تنقلب، والعربي يُكتب ويُحاذى لليسار.
*/
window.CONTENT = {
  en: {
    lang: 'en',
    title: 'MOHAMMED · Maison de Parfum',
    brand: 'MOHAMMED',
    nav: { home: 'Home', collection: 'Collection', wear: 'Wear it', craft: 'Craft', voices: 'Voices' },
    langBtn: 'العربية',
    soundOn: 'Sound on', soundOff: 'Sound off',
    bag: 'Bag',
    loader: 'Lighting the flame',
    scrollCue: 'Scroll to ignite',
    soundTip: 'Turn the sound on for the full experience',
    chapters: [
      { k: 'MAISON DE PARFUM · EST. 2026', t: 'MOHAMMED', s: 'Where oud meets fire.' },
      { k: 'CHAPTER I', t: 'Born from fire', s: 'Smoked oud, cinnamon bark and ember amber, lit slowly and left to rise.' },
      { k: 'CHAPTER II', t: 'One full turn', s: 'Turn it, and the scent turns with you: the first spark, the warm heart, the long amber trail.' },
      { k: 'CHAPTER III', t: 'Crowned in gold', s: 'A hand-cut glass stopper and a brushed gold collar. Lift the crown, and the first breath escapes.' },
      { k: 'CHAPTER IV', t: 'Settle into it', s: 'Twelve hours on skin. A quiet flame that never quite goes out.', cta: 'Enter the collection' }
    ],
    dots: ['Ignite', 'Rise', 'Turn', 'Crown', 'Settle'],
    shop: {
      k: 'THE COLLECTION', t: 'Six scents. Six atmospheres.', s: 'Slide the shelf and the whole room changes. Tap a bottle to spray it.',
      cur: { drag: 'Drag', rotate: 'Rotate', select: 'Select' },
      spray: 'Spray', sprayTip: 'Tap the bottle or press S',
      top: 'Top', heart: 'Heart', base: 'Base', size: 'Size', engrave: 'Engrave a name', engraveSub: 'Free. Shown on the bottle as you type.', engravePh: 'Your name',
      qty: 'Qty', add: 'Add to bag', added: 'Added to bag', edp: 'Eau de Parfum', ship: 'Free shipping over $200 · ships in 2–3 days',
      prev: 'Previous scent', next: 'Next scent'
    },
    cart: {
      title: 'Your bag', empty: 'Your bag is empty', emptySub: 'Choose a scent from the collection.', browse: 'Browse the collection',
      subtotal: 'Subtotal', shipping: 'Shipping', free: 'Free', discount: 'Discount', total: 'Total', checkout: 'Checkout', remove: 'Remove',
      promo: 'Promo code', apply: 'Apply', promoOk: 'FIRE10 applied: 10% off', promoBad: 'Code not valid. Try FIRE10.', engraved: 'Engraved', taxes: 'Taxes included', freeAt: 'Free shipping over $200',
      close: 'Close', more: 'more to free shipping'
    },
    checkout: {
      title: 'Checkout', steps: ['Details', 'Payment', 'Done'],
      demo: 'Demo checkout · no payment is taken and nothing is sent anywhere.',
      contact: 'Contact', delivery: 'Delivery', email: 'Email', name: 'Full name', phone: 'Phone', address: 'Address', city: 'City', zip: 'Postal code', country: 'Country', gift: 'Gift message (optional)',
      fillDemo: 'Fill demo details', toPay: 'Continue to payment', back: 'Back',
      payTitle: 'Payment', cardNo: 'Card number', holder: 'Name on card', expiry: 'Expiry (MM/YY)', cvc: 'CVC', testHint: 'Use the test card 4242 4242 4242 4242 with any future date and any CVC.', useTest: 'Use test card',
      pay: 'Pay', secure: 'Encrypted demo form · nothing leaves your browser',
      badCard: 'Demo mode accepts test cards only. Try 4242 4242 4242 4242.', badExp: 'Use a future date', badCvc: 'Check the code', req: 'Required', badEmail: 'Check the email',
      processing: 'Sealing your order…', thanks: 'Thank you', thanksSub: 'Your order is sealed and on its way to the atelier.', orderNo: 'Order', eta: 'Estimated delivery', again: 'Keep exploring', summary: 'Order summary',
      concept: 'This is a concept store: no real order was placed.',
      countries: ['Germany', 'France', 'Netherlands', 'Turkey', 'United Arab Emirates', 'Saudi Arabia', 'United Kingdom', 'United States']
    },
    wear: {
      k: 'WEAR IT', t: 'Twelve hours on skin.', s: 'Drag the clock. Watch the scent open, bloom and settle.',
      play: 'Play 12 hours', pause: 'Pause', pick: 'Choose a scent', top: 'Top notes', heart: 'Heart notes', base: 'Base notes', h: 'h',
      phases: ['First spray: bright and sparkling', 'Opening: the top notes lift away', 'The heart blooms, warm and full', 'Settling into the skin', 'Down to the base: a quiet amber trail'],
      intensity: 'Intensity'
    },
    craft: {
      k: 'THE CRAFT', t: 'Made slowly, by hand.',
      steps: [
        { n: '01', t: 'Harvest', d: 'Wood, bark and petals gathered in small lots, at the hour each is best.' },
        { n: '02', t: 'Distill', d: 'Copper stills, low flame, no shortcuts. The first drop is always the clearest.' },
        { n: '03', t: 'Age', d: 'Months of rest until the notes fuse and the colour deepens to amber.' },
        { n: '04', t: 'Pour', d: 'Poured, sealed and numbered by hand, then engraved with your name.' }
      ]
    },
    voices: {
      k: 'VOICES', t: 'Tied to every bottle.', s: 'Brush the tags. They remember who wore it.',
      items: [
        { q: 'It smells like a fire at the edge of a desert night.', a: 'Nour A. · Dubai' },
        { q: 'Warm, dark and somehow clean. I get asked about it everywhere.', a: 'Karim S. · Istanbul' },
        { q: 'The cinnamon is unreal. Twelve hours later it is still there.', a: 'Lina M. · Berlin' },
        { q: 'I engraved my daughter’s name. She has not put it down since.', a: 'Omar H. · Gaziantep' }
      ]
    },
    contact: { k: 'STAY CLOSE', t: 'Be first to the next batch.', s: 'One email when a new fragrance is poured. Nothing else.', ph: 'Your email', btn: 'Notify me', thanks: 'Thank you. This is a concept demo, nothing was sent.' },
    footer: { made: 'Designed & developed by Muhammed Elhuseyin', concept: 'Concept project: fictional brand, products and reviews. The checkout is a demo and no payment is taken.', rights: '© 2026 Mohammed Maison de Parfum (concept)' },
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
    nav: { home: 'الرئيسية', collection: 'المجموعة', wear: 'جرّبه', craft: 'الصنعة', voices: 'آراء' },
    langBtn: 'English',
    soundOn: 'الصوت يعمل', soundOff: 'الصوت متوقف',
    bag: 'الحقيبة',
    loader: 'نُشعل اللهب',
    scrollCue: 'مرّر لتشتعل',
    soundTip: 'شغّل الصوت لتجربة كاملة',
    chapters: [
      { k: 'دار العطور · منذ ٢٠٢٦', t: 'محمد', s: 'حيث يلتقي العود بالنار.' },
      { k: 'الفصل الأول', t: 'وُلد من النار', s: 'عود مدخّن ولحاء القرفة وعنبر الجمر، يشتعل ببطء ويرتفع بهدوء.' },
      { k: 'الفصل الثاني', t: 'دورة كاملة', s: 'أدِرْه فيدور العطر معك: الشرارة الأولى، والقلب الدافئ، وأثر العنبر الطويل.' },
      { k: 'الفصل الثالث', t: 'متوّج بالذهب', s: 'سدادة زجاج مقطوعة يدوياً وطوق ذهبي مصقول. ارفع التاج فيهرب النَّفَس الأول.' },
      { k: 'الفصل الرابع', t: 'استقر فيه', s: 'اثنتا عشرة ساعة على البشرة. لهب هادئ لا ينطفئ تماماً.', cta: 'ادخل المجموعة' }
    ],
    dots: ['اشتعال', 'ارتفاع', 'دوران', 'تاج', 'استقرار'],
    shop: {
      k: 'المجموعة', t: 'ست عطور. ست أجواء.', s: 'حرّك الرف فيتغيّر المكان كله. المس الزجاجة لترشّها.',
      cur: { drag: 'اسحب', rotate: 'أدِر', select: 'اختر' },
      spray: 'رشّة', sprayTip: 'المس الزجاجة أو اضغط S',
      top: 'الافتتاحية', heart: 'القلب', base: 'القاعدة', size: 'الحجم', engrave: 'انقش اسماً', engraveSub: 'مجاناً. يظهر على الزجاجة وأنت تكتب.', engravePh: 'اسمك',
      qty: 'الكمية', add: 'أضف إلى الحقيبة', added: 'أُضيف إلى الحقيبة', edp: 'ماء عطر', ship: 'شحن مجاني فوق ٢٠٠$ · يصل خلال ٢–٣ أيام',
      prev: 'العطر السابق', next: 'العطر التالي'
    },
    cart: {
      title: 'حقيبتك', empty: 'حقيبتك فارغة', emptySub: 'اختر عطراً من المجموعة.', browse: 'تصفّح المجموعة',
      subtotal: 'المجموع الفرعي', shipping: 'الشحن', free: 'مجاني', discount: 'الخصم', total: 'الإجمالي', checkout: 'إتمام الشراء', remove: 'إزالة',
      promo: 'رمز الخصم', apply: 'تطبيق', promoOk: 'تم تطبيق FIRE10: خصم ١٠٪', promoBad: 'الرمز غير صالح. جرّب FIRE10.', engraved: 'منقوش', taxes: 'الضرائب مشمولة', freeAt: 'شحن مجاني فوق ٢٠٠$',
      close: 'إغلاق', more: 'متبقٍ للشحن المجاني'
    },
    checkout: {
      title: 'إتمام الشراء', steps: ['البيانات', 'الدفع', 'تم'],
      demo: 'دفع تجريبي · لا يُسحب أي مبلغ ولا يُرسل شيء إلى أي جهة.',
      contact: 'التواصل', delivery: 'التوصيل', email: 'البريد الإلكتروني', name: 'الاسم الكامل', phone: 'الهاتف', address: 'العنوان', city: 'المدينة', zip: 'الرمز البريدي', country: 'الدولة', gift: 'رسالة هدية (اختياري)',
      fillDemo: 'عبّئ بيانات تجريبية', toPay: 'المتابعة إلى الدفع', back: 'رجوع',
      payTitle: 'الدفع', cardNo: 'رقم البطاقة', holder: 'الاسم على البطاقة', expiry: 'الانتهاء (شهر/سنة)', cvc: 'رمز الأمان', testHint: 'استخدم البطاقة التجريبية 4242 4242 4242 4242 مع أي تاريخ مستقبلي وأي رمز.', useTest: 'استخدم البطاقة التجريبية',
      pay: 'ادفع', secure: 'نموذج تجريبي · لا شيء يغادر متصفحك',
      badCard: 'الوضع التجريبي يقبل بطاقات الاختبار فقط. جرّب 4242 4242 4242 4242.', badExp: 'استخدم تاريخاً مستقبلياً', badCvc: 'تحقق من الرمز', req: 'مطلوب', badEmail: 'تحقق من البريد',
      processing: 'نختم طلبك…', thanks: 'شكراً لك', thanksSub: 'طلبك مختوم وفي طريقه إلى المشغل.', orderNo: 'الطلب', eta: 'موعد التوصيل المتوقع', again: 'تابع الاستكشاف', summary: 'ملخص الطلب',
      concept: 'هذا متجر تجريبي: لم يُنشأ أي طلب حقيقي.',
      countries: ['ألمانيا', 'فرنسا', 'هولندا', 'تركيا', 'الإمارات', 'السعودية', 'المملكة المتحدة', 'الولايات المتحدة']
    },
    wear: {
      k: 'جرّبه', t: 'اثنتا عشرة ساعة على البشرة.', s: 'حرّك الساعة. شاهد العطر ينفتح ويزهر ويستقر.',
      play: 'شغّل ١٢ ساعة', pause: 'إيقاف', pick: 'اختر عطراً', top: 'النوتات العليا', heart: 'نوتات القلب', base: 'نوتات القاعدة', h: 'س',
      phases: ['أول رشّة: لامعة وفوّارة', 'الانفتاح: ترتفع النوتات العليا', 'يزهر القلب، دافئاً وممتلئاً', 'يستقر على البشرة', 'ينزل إلى القاعدة: أثر عنبر هادئ'],
      intensity: 'الشدة'
    },
    craft: {
      k: 'الصنعة', t: 'يُصنع ببطء وباليد.',
      steps: [
        { n: '٠١', t: 'الحصاد', d: 'خشب ولحاء وبتلات تُجمع بدفعات صغيرة، في الساعة التي يكون فيها كلٌّ في أفضل حالاته.' },
        { n: '٠٢', t: 'التقطير', d: 'قدور نحاسية ولهب هادئ بلا اختصارات. أول قطرة هي دائماً الأصفى.' },
        { n: '٠٣', t: 'التعتيق', d: 'أشهر من الراحة حتى تندمج النوتات ويتعمّق اللون إلى عنبر.' },
        { n: '٠٤', t: 'التعبئة', d: 'تُسكب وتُختم وتُرقَّم باليد، ثم يُنقش عليها اسمك.' }
      ]
    },
    voices: {
      k: 'آراء', t: 'معلّقة بكل زجاجة.', s: 'المس البطاقات. إنها تتذكر من ارتداه.',
      items: [
        { q: 'رائحته كنار على حافة ليلة صحراوية.', a: 'نور أ. · دبي' },
        { q: 'دافئ وداكن ونظيف بطريقة غريبة. يسألونني عنه في كل مكان.', a: 'كريم س. · إسطنبول' },
        { q: 'القرفة لا تُصدَّق. بعد اثنتي عشرة ساعة ما زالت موجودة.', a: 'لينا م. · برلين' },
        { q: 'نقشتُ اسم ابنتي عليه، ولم تتركه من يدها منذ ذلك اليوم.', a: 'عمر ح. · غازي عنتاب' }
      ]
    },
    contact: { k: 'ابقَ قريباً', t: 'كن أول من يعرف الدفعة القادمة.', s: 'رسالة واحدة عند صبّ عطر جديد. لا شيء غيرها.', ph: 'بريدك الإلكتروني', btn: 'أخبرني', thanks: 'شكراً. هذا عرض تجريبي ولم يُرسل شيء.' },
    footer: { made: 'تصميم وتطوير محمد الحسين', concept: 'مشروع تجريبي: علامة ومنتجات وآراء مفترضة. الدفع تجريبي ولا يُسحب أي مبلغ.', rights: '© ٢٠٢٦ محمد دار العطور (تجريبي)' },
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

/* الأحجام: 30 / 50 / 100 مل (السعر الأساسي لـ 50 مل) */
window.SIZES = [{ ml: 30, k: 0.68 }, { ml: 50, k: 1 }, { ml: 100, k: 1.62 }];
