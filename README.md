# MOHAMMED · Maison de Parfum (مشروع تجريبي)

متجر عطور بمشهد ثلاثي الأبعاد حقيقي (WebGL / three.js) يعمل لحظياً في المتصفح، مع سلة وإتمام شراء كامل **تجريبي**.
العلامة والمنتجات والآراء كلها **مفترضة**، والدفع تجريبي: لا شبكة ولا حفظ لأي بيانات بطاقة.

تصميم وتطوير: محمد الحسين (Muhammed Elhuseyin).

## التشغيل
- انقر مرتين على `run-site.bat` (يشغّل خادماً محلياً على 3400 ويفتح كروم).
- **لا يعمل بفتح `index.html` مباشرة** (وحدات ES و importmap تحتاج خادماً). على GitHub Pages يعمل عادي.

## ما فيه
- **الهيرو (5 وقفات):** سكرول واحد (عجلة / سحب باللمس / أسهم / النقاط اليمنى) = وقفة. الكاميرا الحقيقية تدور وتقترب بلا أي فقدان جودة، الزجاجة تعلو وتدور دورة كاملة، يُرفع الغطاء الذهبي وتخرج رشّة. الجمر يطير بسرعة مع الحركة ويطفو ببطء عند الوقوف.
- **رف العطور:** ست زجاجات مبنية بالكود (زجاج بانكسار حقيقي، سائل بسطح مائل يرتجّ، أغطية معدنية). كل عطر له **جوّه الخاص** وجسيماته: جمر ونار / دخان أسود بعروق ذهب / بتلات وبوكيه ورد / أشعة عسل / ليل أزرق بنجوم وقمر / كثبان وغروب. تنزلق الزجاجات على منصة لامعة تعكسها وتميل ويرتجّ سائلها كصينية متحركة (فيزياء).
- **تفاعل:** اسحب الرف، اسحب الزجاجة المحددة لتدويرها، المس الزجاجة أو اضغط S لرشّها: يخرج رذاذ وتطفو كلمات النوتات (افتتاحية/قلب/قاعدة) داخله.
- **نقش اسم حي:** اكتب اسماً فيظهر ذهبياً على الزجاجة المجسّمة وأنت تكتب (والعربي "محمد" على ظهر كل زجاجة).
- **المتجر:** أحجام 30/50/100 مل، كمية، إضافة للحقيبة بطيران الزجاجة إلى أيقونة الحقيبة، درج الحقيبة (كمية، حذف، شريط الشحن المجاني فوق 200$، كود خصم `FIRE10` = 10%)، ثم إتمام الشراء بثلاث خطوات: بيانات → دفع → تأكيد (ختم شمع وقصاصات ذهبية، رقم طلب، موعد توصيل). الحقيبة تُحفظ في المتصفح.
- **للتصوير:** زر "Fill demo details" يعبّئ بيانات وهمية، وزر "Use test card" يعبّئ البطاقة التجريبية `4242 4242 4242 4242`. أي بطاقة غير بطاقات الاختبار تُرفض حتى لا يكتب أحد بطاقته الحقيقية.
- **جرّبه:** ساعة عطر (12 ساعة على البشرة) تحرّكها بيدك أو تشغّلها: تنفتح الافتتاحية وتزهر النوتات الوسطى وتستقر القاعدة، مع منحنيات حية.
- **الصنعة:** دورق يمتلئ ويتغير لونه مع كل خطوة وأنت تمرّر.
- **آراء:** بطاقات معلّقة بخيوط تتأرجح بفيزياء عند لمسها بالماوس.
- **صوت:** مؤثرات مولّدة بالكود (رذاذ، زجاج، وشوشة بين الوقفات، ختم الطلب، طقطقة نار خفيفة). مطفأ افتراضياً، زر الصوت أعلى الصفحة.
- **مؤشر ماوس بهوية العلامة:** شعلة + حلقة ذهبية + شرار، تتحول لكلمة (Drag / Rotate / Select / Sound).
- لغتان (EN / عربي). الصفحة **لا تنقلب أبداً**: الاتجاه LTR والنص العربي يُحاذى لليسار.
- الأداء: على RTX 4050 يثبت على سقف الشاشة (144Hz) حتى بدقة 4K. وللأجهزة الأضعف تخفّض الجودة تلقائياً (دقة، خلفية، شفافية الزجاج). على الموبايل جودة أخف تلقائياً. بدون WebGL يعمل الموقع بصور العطور الثابتة.

## الصور
- `assets/bottles/*.webp`: صور منتجات واقعية مولّدة بالذكاء الاصطناعي (لوما، الخطة المجانية = استخدام غير تجاري). تُستعمل في الحقيبة والمصغّرات وبديل بدون WebGL، وقصصنا منها الشريط السفلي الذي فيه العلامة المائية.
- المشهد الثلاثي الأبعاد نفسه كله مولّد بالكود ولا يعتمد على أي صور أو فيديو.

## الملفات
```
index.html              هيكل الصفحة
css/style.css           التصميم (لون التمييز --accent يتغير مع كل عطر)
js/gl/core.js           المشهد: renderer + بيئة انعكاسات + خلفيات الأجواء + جسيمات + رذاذ + منصة لامعة
js/gl/shaders.js        كل الشيدرات (الأجواء الستة، السائل، الجسيمات، الرذاذ، انعكاس الأرض)
js/gl/bottles.js        الزجاجات الست بالكود + النقش
js/gl/experience.js     الوقفات الخمس + الرف + الفيزياء + الإدخال (ماوس/لمس/لوحة)
js/gl/sfx.js            الصوت
js/app.js               الواجهة: لغات، لوحة العطر، رذاذ الكلمات، الإضافة للحقيبة
js/store.js             الحقيبة + إتمام الشراء + الدفع التجريبي
js/sections.js          ساعة العطر + الدورق + البطاقات المعلّقة
js/content.js           كل النصوص (عربي + إنجليزي) والعطور وأسعارها
js/cursor.js            مؤشر الماوس
js/vendor/              three.js r172 (محلي، لا يعتمد على CDN)
```
الوقفات (كاميرا ورفع ودوران) في مصفوفة `HERO` أعلى `js/gl/experience.js`. ألوان وأجواء كل عطر في `MOODS` و`PART` داخل `js/gl/core.js`.

النسخة السابقة (فيديو لوما + إطارات) محفوظة في `C:\mhd_v1_backup` وفي تاريخ ريبو GitHub.

## Hero: looping video, one screen (2026-10-24)
The hero is one screen: the first headline over a light looping video (`assets/hero/loop-desktop.mp4` 1920x1080, `assets/hero/loop-phone.mp4` 720 wide, about 15 s, roughly 1-6 MB), rendered offline from the live 3D scene at constant speed (no stops, no easing) and looped with a short cross-dissolve from the end of the journey back into its start, so it repeats with no cut. It has nothing to do with scrolling: `js/hero-video.js` sets it to `loop`, plays it while the hero is on screen, pauses it as soon as the hero leaves the viewport and removes the source (frees the memory) when the visitor is far from the hero. Scrolling is plain native scrolling. The poster (first frame of the loop) stays until the video plays (and on browsers that block autoplay, such as iPhone Low Power Mode, until the first touch). `?hero=off`, data-saver and reduced motion keep the still poster. Earlier versions: tall pinned story with the looping video, four-stop clips (`_clips_four_stop_version/`), image sequence, live 3D (`_live3d_version/`, git history). Re-render with `_hero_video_tools/capture_loop.py` (original 3D versions are extracted to C:\l3d\<site> with git archive) then `encode_loop2.py`.
