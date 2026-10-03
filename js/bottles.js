/*
  ست زجاجات عطر مرسومة بالكود (SVG): كل واحدة بشكل مختلف، بنفس هوية الماركة.
  كل شيء أصلي ولا يعتمد على صور خارجية.
*/
(function () {
  var n = 0;
  var GOLD = '<linearGradient id="{u}gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3d0"/><stop offset=".35" stop-color="#e9b862"/><stop offset=".7" stop-color="#9a6420"/><stop offset="1" stop-color="#f4d58f"/></linearGradient>';
  var GLASS = '<linearGradient id="{u}gl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".45" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#fff" stop-opacity=".24"/></linearGradient>';

  function label(x, y, size, fill, rot) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-weight="600" font-size="' + size + '" letter-spacing="2.2" fill="' + fill + '"' + (rot ? ' transform="rotate(-90 ' + x + ' ' + y + ')"' : '') + '>MOHAMMED</text>';
  }

  var B = {
    ember: function (u) {
      return '<defs>' + GOLD + GLASS +
        '<linearGradient id="' + u + 'lq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb347"/><stop offset=".55" stop-color="#c4570f"/><stop offset="1" stop-color="#6e2907"/></linearGradient></defs>' +
        '<rect x="48" y="108" width="104" height="158" rx="12" fill="url(#' + u + 'gl)" stroke="#f6cf8b" stroke-opacity=".55"/>' +
        '<rect x="55" y="138" width="90" height="122" rx="8" fill="url(#' + u + 'lq)"/>' +
        '<rect x="86" y="90" width="28" height="22" fill="url(#' + u + 'gl)" stroke="#f6cf8b" stroke-opacity=".4"/>' +
        '<rect x="76" y="46" width="48" height="50" rx="7" fill="url(#' + u + 'gd)"/><rect x="82" y="52" width="6" height="38" rx="3" fill="#fff" opacity=".35"/>' +
        '<rect x="80" y="92" width="40" height="8" rx="3" fill="url(#' + u + 'gd)"/>' +
        '<rect x="64" y="168" width="72" height="46" rx="3" fill="rgba(0,0,0,.22)" stroke="#f6cf8b" stroke-opacity=".7"/>' + label(100, 196, 10.5, '#ffe3ad') +
        '<path d="M100 202v6" stroke="#f6cf8b" stroke-opacity=".6"/>' +
        '<path d="M58 118V252" stroke="#fff" stroke-opacity=".28" stroke-width="3" stroke-linecap="round"/>';
    },
    noir: function (u) {
      return '<defs>' + GOLD +
        '<linearGradient id="' + u + 'bk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#43434b"/><stop offset=".4" stop-color="#15151a"/><stop offset=".75" stop-color="#0b0b0e"/><stop offset="1" stop-color="#2d2d33"/></linearGradient></defs>' +
        '<rect x="58" y="100" width="84" height="170" rx="16" fill="url(#' + u + 'bk)"/>' +
        '<rect x="58" y="100" width="84" height="7" fill="url(#' + u + 'gd)"/><rect x="58" y="262" width="84" height="7" fill="url(#' + u + 'gd)"/>' +
        '<rect x="68" y="52" width="64" height="52" rx="9" fill="url(#' + u + 'bk)"/><rect x="68" y="86" width="64" height="5" fill="url(#' + u + 'gd)"/>' +
        '<rect x="74" y="58" width="5" height="40" rx="2.5" fill="#fff" opacity=".18"/>' +
        label(104, 186, 13, '#f6cf8b', true) +
        '<path d="M126 124V250" stroke="#fff" stroke-opacity=".12" stroke-width="3" stroke-linecap="round"/>';
    },
    rose: function (u) {
      return '<defs>' +
        '<linearGradient id="' + u + 'rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe6d9"/><stop offset=".5" stop-color="#e5988c"/><stop offset="1" stop-color="#8d4a48"/></linearGradient>' +
        '<linearGradient id="' + u + 'lq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb08f"/><stop offset=".5" stop-color="#cf5a6e"/><stop offset="1" stop-color="#7a1f3d"/></linearGradient>' + GLASS +
        '<clipPath id="' + u + 'cp"><circle cx="100" cy="198" r="70"/></clipPath></defs>' +
        '<circle cx="100" cy="198" r="72" fill="url(#' + u + 'gl)" stroke="#f3b9a8" stroke-opacity=".6"/>' +
        '<g clip-path="url(#' + u + 'cp)"><rect x="30" y="184" width="140" height="90" fill="url(#' + u + 'lq)"/><ellipse cx="100" cy="184" rx="70" ry="7" fill="#ffc9a8" opacity=".6"/></g>' +
        '<rect x="88" y="112" width="24" height="22" fill="url(#' + u + 'gl)" stroke="#f3b9a8" stroke-opacity=".4"/>' +
        '<circle cx="100" cy="92" r="24" fill="url(#' + u + 'rg)"/><ellipse cx="92" cy="84" rx="6" ry="10" fill="#fff" opacity=".4"/>' +
        label(100, 214, 11, '#fff3ea') +
        '<path d="M52 170Q60 140 84 134" stroke="#fff" stroke-opacity=".3" stroke-width="3" fill="none" stroke-linecap="round"/>';
    },
    veil: function (u) {
      return '<defs>' + GOLD + GLASS +
        '<linearGradient id="' + u + 'lq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd987"/><stop offset=".55" stop-color="#d78a20"/><stop offset="1" stop-color="#8a490a"/></linearGradient>' +
        '<linearGradient id="' + u + 'dk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a2d22"/><stop offset=".5" stop-color="#120c08"/><stop offset="1" stop-color="#2e2318"/></linearGradient></defs>' +
        '<path d="M74 108H126L134 128V262Q134 274 122 274H78Q66 274 66 262V128Z" fill="url(#' + u + 'gl)" stroke="#f6cf8b" stroke-opacity=".5"/>' +
        '<path d="M72 150H128V264Q128 268 122 268H78Q72 268 72 264Z" fill="url(#' + u + 'lq)"/>' +
        '<rect x="90" y="92" width="20" height="18" fill="url(#' + u + 'gl)"/>' +
        '<rect x="82" y="30" width="36" height="66" rx="4" fill="url(#' + u + 'dk)"/><rect x="82" y="62" width="36" height="4" fill="url(#' + u + 'gd)"/>' +
        '<rect x="87" y="36" width="4" height="52" rx="2" fill="#fff" opacity=".16"/>' +
        label(100, 212, 11.5, '#2a1606', true) +
        '<path d="M72 132V250" stroke="#fff" stroke-opacity=".28" stroke-width="3" stroke-linecap="round"/>';
    },
    musk: function (u) {
      return '<defs>' +
        '<linearGradient id="' + u + 'bl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3c4870"/><stop offset=".6" stop-color="#121830"/><stop offset="1" stop-color="#070a16"/></linearGradient>' +
        '<linearGradient id="' + u + 'sv" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d96a8"/><stop offset=".4" stop-color="#fff"/><stop offset="1" stop-color="#6c7588"/></linearGradient>' +
        '<linearGradient id="' + u + 'lq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb6ea" stop-opacity=".85"/><stop offset="1" stop-color="#34456f" stop-opacity=".9"/></linearGradient></defs>' +
        '<polygon points="100,98 152,128 152,246 100,274 48,246 48,128" fill="url(#' + u + 'bl)" stroke="#aab8e0" stroke-opacity=".5"/>' +
        '<polygon points="100,98 48,128 48,246 100,274" fill="#fff" opacity=".06"/>' +
        '<polygon points="100,98 152,128 152,246 100,274" fill="#000" opacity=".22"/>' +
        '<polygon points="100,150 138,170 138,238 100,258 62,238 62,170" fill="url(#' + u + 'lq)" opacity=".75"/>' +
        '<path d="M100 98V274" stroke="#fff" stroke-opacity=".28"/><path d="M48 128L100 154L152 128" stroke="#fff" stroke-opacity=".2" fill="none"/>' +
        '<rect x="80" y="50" width="40" height="46" rx="5" fill="url(#' + u + 'sv)"/><rect x="84" y="56" width="4" height="34" rx="2" fill="#fff" opacity=".5"/>' +
        '<rect x="86" y="92" width="28" height="8" rx="2" fill="url(#' + u + 'sv)"/>' +
        label(100, 206, 10.5, '#e4ecff');
    },
    dunes: function (u) {
      return '<defs>' + GOLD + GLASS +
        '<linearGradient id="' + u + 'lq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe591"/><stop offset=".5" stop-color="#e0a030"/><stop offset="1" stop-color="#8a5510"/></linearGradient></defs>' +
        '<path d="M64 132Q64 112 84 112H116Q136 112 136 132L146 252Q148 280 118 280H82Q52 280 54 252Z" fill="url(#' + u + 'gl)" stroke="#f6cf8b" stroke-opacity=".55"/>' +
        '<path d="M62 168L138 168L146 252Q148 274 118 274H82Q52 274 54 252Z" fill="url(#' + u + 'lq)"/>' +
        '<rect x="88" y="94" width="24" height="20" fill="url(#' + u + 'gl)"/>' +
        '<rect x="76" y="58" width="48" height="40" rx="8" fill="url(#' + u + 'gd)"/><circle cx="100" cy="78" r="6" fill="#5a3a10" opacity=".55"/><rect x="82" y="64" width="5" height="28" rx="2.5" fill="#fff" opacity=".4"/>' +
        '<rect x="66" y="196" width="68" height="40" rx="3" fill="rgba(0,0,0,.2)" stroke="#fff3d0" stroke-opacity=".7"/>' + label(100, 221, 10.5, '#fff3d0') +
        '<path d="M66 140Q64 200 62 240" stroke="#fff" stroke-opacity=".3" stroke-width="3" fill="none" stroke-linecap="round"/>';
    }
  };

  window.BOTTLES = {
    svg: function (id, cls) {
      n++;
      var u = 'b' + n + '_';
      var fn = B[id] || B.ember;
      var body = fn(u).replace(/\{u\}/g, u);
      return '<svg class="bottle ' + (cls || '') + '" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<ellipse cx="100" cy="286" rx="62" ry="8" fill="#000" opacity=".5"/>' + body + '</svg>';
    }
  };

  // أيقونات بسيطة لقسم المكوّنات
  window.ICONS = {
    flame: '<svg viewBox="0 0 24 32" aria-hidden="true"><path d="M12 1c1 5 7 8 7 16a7 7 0 0 1-14 0c0-3 1.5-5 3-6.5C8.5 13 10 13 10 10c0-3 1-6 2-9z" fill="url(#flg)"/><path d="M12 15c.6 2.4 3 3.4 3 6a3 3 0 0 1-6 0c0-2 1.6-3 2-4.5.4-.8.8-1 1-1.5z" fill="#fff3d0" opacity=".9"/></svg>',
    oud: '<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="46" rx="22" ry="8" fill="#2a1a10"/><path d="M12 30c0-6 40-6 40 0v12c0 6-40 6-40 0z" fill="#4a2a16" stroke="#f2a23a" stroke-opacity=".6"/><ellipse cx="32" cy="30" rx="20" ry="5.5" fill="#7a4524" stroke="#f6cf8b" stroke-opacity=".7"/><circle cx="32" cy="30" r="2" fill="#f6cf8b"/><path d="M46 12c-3 4 3 6 0 10M38 8c-3 4 3 6 0 10" stroke="#f6cf8b" stroke-opacity=".6" fill="none" stroke-linecap="round"/></svg>',
    cinnamon: '<svg viewBox="0 0 64 64" aria-hidden="true"><g stroke="#f2a23a" stroke-opacity=".7"><rect x="10" y="38" width="44" height="9" rx="4.5" fill="#a85a26" transform="rotate(-18 32 42)"/><rect x="8" y="28" width="44" height="9" rx="4.5" fill="#c4713a" transform="rotate(-6 30 32)"/><rect x="12" y="18" width="44" height="9" rx="4.5" fill="#8e4a1f" transform="rotate(10 34 22)"/></g><circle cx="52" cy="46" r="3" fill="#f6cf8b" opacity=".7"/></svg>',
    blossom: '<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="#ffd9c4" stroke="#f2a23a" stroke-opacity=".6"><ellipse cx="32" cy="16" rx="9" ry="13"/><ellipse cx="32" cy="48" rx="9" ry="13"/><ellipse cx="16" cy="32" rx="13" ry="9"/><ellipse cx="48" cy="32" rx="13" ry="9"/></g><circle cx="32" cy="32" r="7" fill="#f2a23a"/><circle cx="32" cy="32" r="3" fill="#fff3d0"/></svg>'
  };
})();
