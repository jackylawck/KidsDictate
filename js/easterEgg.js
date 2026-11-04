/**
 * =====================================================================
 * 🌟 童心默書 KidsDictate · 家長心靈減壓與親子共讀終端 (F12 Easter Egg)
 * 100% Client-Side Pure JS · 零依賴 · 減輕育兒焦慮 · 守護親子關係
 * =====================================================================
 */
(function () {
  'use strict';

  var MONO = '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace';

  var S = {
    title: 'background: #4F46E5; color: #FFFFFF; font-family: ' + MONO + '; font-size: 13px; font-weight: 900; padding: 6px 12px; border-radius: 4px; display: block;',
    sub: 'background: #EEF2FF; color: #4338CA; font-family: ' + MONO + '; font-size: 11px; font-weight: bold; padding: 4px 10px; border-left: 4px solid #6366F1; margin: 4px 0;',
    badgePass: 'background: #10B981; color: #FFFFFF; font-family: ' + MONO + '; font-size: 11px; font-weight: 900; padding: 3px 8px; border-radius: 3px;',
    panel: 'background: #0F172A; color: #38BDF8; font-family: ' + MONO + '; font-size: 11.5px; line-height: 1.6; padding: 10px 14px; border-left: 4px solid #38BDF8; border-radius: 4px; display: block; white-space: pre;',
    quote: 'background: #FFFBEB; color: #B45309; font-family: ' + MONO + '; font-size: 12px; font-weight: bold; padding: 8px 12px; border-left: 4px solid #F59E0B; border-radius: 4px; display: block;',
    cmdKey: 'background: #6366F1; color: #FFFFFF; font-weight: 900; font-family: ' + MONO + '; padding: 2px 6px; border-radius: 3px;',
    cmdDesc: 'color: #334155; font-family: ' + MONO + '; font-weight: 600; padding: 2px 6px;'
  };

  var CHEER_QUOTES = [
    '「默書只係一時嘅練習，親子關係先係一世嘅記憶。慢慢嚟，唔好急。」',
    '「錯一隻字唔會世界末日，識得喺邊度跌低再爬返起，先係最寶貴嘅學習。」',
    '「今日識多一個詞語，就係進步 100%。多啲讚賞佢嘅專注同努力！」',
    '「大人返工都經常打錯字，對小朋友寬容啲，佢哋會更加熱愛文字。」',
    '「分數係浮雲，佢喺你身邊努力握筆寫字嘅背影，先係最值得珍惜嘅風景。」'
  ];

  var REWARDS = [
    '陀螺對決一場 🌀（放下功課，同仔仔展開熱血對決！）',
    '五分鐘天馬行空擁抱時間 🤗（咩都唔諗，單純抱一抱講句辛苦晒）',
    '自選睡前繪本一本 📖（今晚放肆讀一本佢最想睇嘅漫畫或故事）',
    '甜品能量補給 🍦（一齊食杯雪糕或者小點心慶祝完成默書）',
    ' High-Five 五連擊 ✋（有力咁同小朋友連續擊掌五次！）'
  ];

  function renderTerminal() {
    console.log('%c🌟 童心默書 KidsDictate // 家長心靈減壓與親職共讀終端', S.title);
    console.log('%c[ PARENT-CHILD DEFENSE LINE // 家庭三道防線認證 ]', S.sub);
    console.log('');
    console.log(
      '%c[ 一線：孩子專注度 (Growth) ] 滿分 %c  %c[ 二線：家長情緒穩定 (Patience) ] 達標 %c  %c[ 三線：陪伴與愛 (Bonding) ] 100% 合意 ',
      S.badgePass, '',
      S.badgePass, '',
      S.badgePass
    );
    console.log('');

    var panelText = [
      '==== [ 家長默書心態指南 // FAMILY GOVERNANCE BASELINE ] ====',
      '• 第一防線 (冷靜)：深吸一口氣，壓住怒火，聲線降低半度。',
      '• 第二防線 (激勵)：見到寫得靚嘅字，即刻具體讚賞佢筆劃端正。',
      '• 第三防線 (邊界)：默書限時完成，時間一到就收工，唔好無休止折磨。',
      '============================================================'
    ].join('\n');
    console.log('%c' + panelText, S.panel);
    console.log('');
    console.log('%c💡 終端減壓指令集：請輸入 kids.help() 或 relax() 查看功能', 'background:#F1F5F9; color:#475569; font-family:' + MONO + '; font-weight:bold; padding:4px 8px; border-radius:3px;');
  }

  var breatheTimer = null;

  function removeBreatheHud() {
    if (breatheTimer) {
      clearInterval(breatheTimer);
      breatheTimer = null;
    }
    var existing = document.getElementById('kids-breathe-hud');
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
  }

  var kidsSuite = Object.freeze({
    help: function () {
      console.log('%c[ 💖 KIDS DICTATE 親子互動指令集 ]', S.sub);
      console.log('%ckids.relax()%c   - 啟動 15 秒家長深呼吸冷靜倒數 HUD / Start breathing coach', S.cmdKey, S.cmdDesc);
      console.log('%ckids.cheer()%c   - 抽取一句家長溫馨減壓心靈金句 / Get parenting encouragement', S.cmdKey, S.cmdDesc);
      console.log('%ckids.reward()%c  - 隨機生成一個默書後嘅「親子小獎勵」/ Spin parent-child reward', S.cmdKey, S.cmdDesc);
      console.log('%ckids.audit()%c   - 檢視當前家庭情緒指數與默書耐性體檢 / Check emotional health', S.cmdKey, S.cmdDesc);
      console.log('%ckids.cheers()%c  - 畫面撒花慶祝默書完成！/ Trigger confetti cheer', S.cmdKey, S.cmdDesc);
      return '輸入上述任一指令（例如 kids.relax()）立即執行。';
    },

    relax: function () {
      removeBreatheHud();

      var hud = document.createElement('div');
      hud.id = 'kids-breathe-hud';
      hud.style.cssText = [
        'position: fixed',
        'top: 0',
        'left: 0',
        'width: 100vw',
        'height: 100vh',
        'background: rgba(15, 23, 42, 0.75)',
        'backdrop-filter: blur(6px)',
        'z-index: 999999',
        'display: flex',
        'align-items: center',
        'justify-content: center',
        'cursor: pointer',
        'user-select: none'
      ].join(';');

      hud.innerHTML = [
        '<div style="background: #FFFFFF; border: 3px solid #6366F1; box-shadow: 0 20px 40px rgba(99, 102, 241, 0.3); border-radius: 20px; padding: 30px 40px; text-align: center; font-family: system-ui, -apple-system, sans-serif; max-width: 380px;">',
        '  <div style="font-size: 32px; margin-bottom: 8px;">🧘‍♂️</div>',
        '  <div style="font-size: 16px; font-weight: 800; color: #4338CA; margin-bottom: 12px;">家長專用 · 深呼吸冷靜區</div>',
        '  <div id="breathe-stage" style="font-size: 22px; font-weight: 900; color: #1E293B; margin: 16px 0; min-height: 32px;">慢鏡吸氣... 唔好動氣</div>',
        '  <div id="breathe-sec" style="font-size: 48px; font-weight: 900; color: #6366F1; font-variant-numeric: tabular-nums;">15</div>',
        '  <div style="font-size: 12px; color: #64748B; margin-top: 14px;">分數唔代表人生成敗 · 親子和睦先係無價<br><span style="color:#94A3B8;">(點擊畫面任意處即可關閉)</span></div>',
        '</div>'
      ].join('');

      document.body.appendChild(hud);
      hud.addEventListener('click', removeBreatheHud);

      var sec = 15;
      var secEl = document.getElementById('breathe-sec');
      var stageEl = document.getElementById('breathe-stage');

      breatheTimer = setInterval(function () {
        sec--;
        if (sec <= 0) {
          removeBreatheHud();
          console.log('%c[ 💖 冷靜完成 ] 能量已重置！用溫柔嘅語氣繼續陪佢默下一題啦。', 'color:#10B981; font-weight:bold; font-size:13px;');
          return;
        }

        if (secEl) secEl.innerText = sec;
        if (stageEl) {
          if (sec > 10) {
            stageEl.innerText = '慢慢深深吸氣... 🌸';
          } else if (sec > 5) {
            stageEl.innerText = '屏住呼吸... 沉澱情緒 🌿';
          } else {
            stageEl.innerText = '放鬆緩緩呼氣... 笑容再現 😊';
          }
        }
      }, 1000);

      return '15 秒深呼吸教練已啟動。點擊螢幕可隨時關閉。';
    },

    cheer: function () {
      var rand = CHEER_QUOTES[Math.floor(Math.random() * CHEER_QUOTES.length)];
      console.log('%c[ 💌 親子溫馨錦囊 ] ' + rand, S.quote);
      return '放鬆啲，佢已經好努力啦！';
    },

    reward: function () {
      var prize = REWARDS[Math.floor(Math.random() * REWARDS.length)];
      console.log('%c🎉 今日默書完成專屬獎勵：%c ' + prize, 'background:#ECFDF5; color:#047857; font-weight:bold; padding:4px 8px; border-radius:3px;', 'color:#065F46; font-weight:900; font-size:13px;');
      return '快啲同小朋友兌現呢個獎勵啦！';
    },

    audit: function () {
      var report = [
        '┌──────────────────────┬────────────────────────┬──────────────────┐',
        '│ 體檢項目 (Dimension) │ 評測狀態 (Status)      │ 建議處方 (Action)│',
        '├──────────────────────┼────────────────────────┼──────────────────┤',
        '│ 1. 孩子書寫耐性      │ [良好] 正在逐步養成    │ 每次連對即刻拍手 │',
        '│ 2. 家長血壓水平      │ [正常] 未觸發暴躁閾值  │ 備妥溫水隨時補充 │',
        '│ 3. 默書環境整潔度    │ [優良] 遠離電子干擾    │ 收起不必要嘅玩具 │',
        '│ 4. 親子溝通質量      │ [滿分] 堅持以鼓勵代替  │ 默完一齊吃點心   │',
        '└──────────────────────┴────────────────────────┴──────────────────┘'
      ].join('\n');
      console.log('%c' + report, S.panel);
      return '家庭默書健康審計合格：情緒穩定，愛與耐心充沛。';
    },

    cheers: function () {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        console.log('%c🎉 [太棒了！] 默書大成功！今次辛苦晒小朋友同家長！', 'color:#6366F1; font-weight:bold; font-size:16px;');
        return '默書完成！減弱動態已生效。';
      }

      var docEl = document.documentElement;
      var originBoxShadow = docEl.style.boxShadow;
      var originTransition = docEl.style.transition;

      docEl.style.transition = 'box-shadow 0.4s ease';
      docEl.style.boxShadow = 'inset 0 0 60px #10B981, inset 0 0 100px #6366F1';

      setTimeout(function () {
        docEl.style.boxShadow = originBoxShadow;
        docEl.style.transition = originTransition;
      }, 1400);

      console.log('%c🎊 默書大功告成！太了不起喇！今晚值得全家慶祝一下！ 🥳', 'background:#10B981; color:#FFFFFF; font-size:14px; font-weight:900; padding:6px 12px; border-radius:4px;');
      return '🎉 撒花特效完成！';
    }
  });

  window.kids = kidsSuite;
  window.relax = kidsSuite.relax; // 方便直覺輸入 relax()

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(renderTerminal, 300);
  } else {
    window.addEventListener('DOMContentLoaded', function () {
      setTimeout(renderTerminal, 300);
    });
  }
})();
