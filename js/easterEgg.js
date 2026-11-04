/**
 * =====================================================================
 * 🌱 童心默書 KidsDictate · 親子正向陪伴與默書加油站 (Console Easter Egg)
 * 100% Client-Side Pure JS · 溫暖陪伴 · 正向激勵 · 守護親子共讀時光
 * =====================================================================
 */
(function () {
  'use strict';

  var MONO = '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace';

  // 採用顯眼、高對比且相容 Console 淺色/深色主題的配色
  var S = {
    title: 'background: #4F46E5; color: #FFFFFF; font-family: ' + MONO + '; font-size: 13px; font-weight: 800; padding: 6px 12px; border-radius: 4px; display: block;',
    badgeGreen: 'background: #DEF7EC; color: #03543F; font-family: ' + MONO + '; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 4px; border: 1px solid #31C48D;',
    badgeAmber: 'background: #FEF3C7; color: #92400E; font-family: ' + MONO + '; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 4px; border: 1px solid #F59E0B;',
    badgePurple: 'background: #EDE9FE; color: #5B21B6; font-family: ' + MONO + '; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 4px; border: 1px solid #8B5CF6;',
    card: 'background: #F8FAFC; color: #0F172A; font-family: ' + MONO + '; font-size: 12px; line-height: 1.8; padding: 12px 16px; border-left: 5px solid #4F46E5; border-radius: 4px; display: block; border-top: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0; white-space: pre;',
    quote: 'background: #FFFBEB; color: #78350F; font-family: ' + MONO + '; font-size: 12px; font-weight: bold; padding: 8px 12px; border-left: 4px solid #F59E0B; border-radius: 4px; display: block;',
    cliBox: 'background: #EEF2FF; color: #312E81; font-family: ' + MONO + '; font-size: 11px; font-weight: bold; padding: 6px 10px; border-radius: 4px; border: 1px solid #C7D2FE; display: block;',
    cmdKey: 'background: #4F46E5; color: #FFFFFF; font-weight: bold; font-family: ' + MONO + '; padding: 2px 7px; border-radius: 3px;',
    cmdDesc: 'color: #334155; font-family: ' + MONO + '; font-weight: 600; padding: 2px 6px;'
  };

  var CHEER_QUOTES = [
    '「默書只係短暫嘅練習，陪伴先係一世嘅回憶。慢慢嚟，小朋友已經好努力！」',
    '「寫錯一隻字唔代表失敗，而係多咗一次學習同進步嘅機會。畀個肯定嘅微笑佢！」',
    '「專注於佢握筆嘅認真神情，多啲具體讚賞佢筆劃寫得端正，佢會更加熱愛學習。」',
    '「大人打字都會有筆誤，放寬心情，溫和堅定嘅語氣就係孩子最好嘅強心針。」',
    '「分數係數字，孩子同你嘅信任連結先係無價之寶。今日一齊完成咗，就值得慶祝！」'
  ];

  var REWARDS = [
    '陀螺對決一場 🌀（放低課本，即刻同仔仔進行一場熱血嘅發射對決！）',
    '溫馨擁抱 30 秒 🤗（咩都唔使講，用行動同佢講：爸爸媽媽好欣賞你嘅堅持）',
    '自選睡前故事一本 📖（今晚畀佢話事，一齊讀一本佢最想睇嘅繪本或漫畫）',
    '點心能量補給 🍦（默完一齊食杯雪糕或者佢鐘意嘅小零食，補充元氣）',
    '默契擊掌 High-Five ✋（連續大力擊掌三次，慶祝今天嘅專注同成長！）'
  ];

  function renderTerminal() {
    console.log('%c🌱 童心默書 KidsDictate // 親子正向陪伴與默書加油站', S.title);
    console.log('');
    console.log(
      '%c💖 專注陪伴 100%%c  %c⭐ 肯定努力 · 每日進步%c  %c😊 笑容常在 · 關係第一 ',
      S.badgeGreen, '',
      S.badgeAmber, '',
      S.badgePurple
    );
    console.log('');

    var cardContent = [
      '==== [ 💡 家長溫馨默書指南 // POSITIVE PARENTING TIPS ] ====',
      '• 讚賞過程：多講「欣賞你咁專心逐個字寫」，建立自信成長型思維。',
      '• 擁抱錯誤：寫錯字時一齊笑笑解拆字形，唔動氣、唔催促。',
      '• 準時收工：定好合理練習時間，默完就合上書本，守護快樂童年。',
      '==========================================================='
    ].join('\n');
    console.log('%c' + cardContent, S.card);
    console.log('');
    console.log('%c👉 互動小工具：請在下方輸入 kids.help() 或 relax() 查看功能', S.cliBox);
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
      console.log('%c[ 💖 KIDS DICTATE 親子互動小幫手 ]', S.cliBox);
      console.log('%ckids.relax()%c   - 啟動 15 秒深呼吸冷靜放鬆儀 / 15s mindful breathing', S.cmdKey, S.cmdDesc);
      console.log('%ckids.cheer()%c   - 抽取一句家長溫馨減壓金句 / Daily parenting quote', S.cmdKey, S.cmdDesc);
      console.log('%ckids.reward()%c  - 隨機抽一份默書完成的親子專屬小獎勵 / Parent-child reward', S.cmdKey, S.cmdDesc);
      console.log('%ckids.cheers()%c  - 畫面泛起成功光芒，慶祝完成練習！/ Celebrate finish', S.cmdKey, S.cmdDesc);
      return '輸入上述任一指令（例如 kids.cheer() 或 relax()）即可執行。';
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
        '  <div style="font-size: 16px; font-weight: 800; color: #4338CA; margin-bottom: 12px;">深呼吸放鬆區</div>',
        '  <div id="breathe-stage" style="font-size: 20px; font-weight: 800; color: #1E293B; margin: 16px 0; min-height: 32px;">緩緩吸氣... 放鬆心情</div>',
        '  <div id="breathe-sec" style="font-size: 48px; font-weight: 900; color: #6366F1; font-variant-numeric: tabular-nums;">15</div>',
        '  <div style="font-size: 12px; color: #64748B; margin-top: 14px;">分數唔代表人生成敗 · 溫柔陪伴先係最長遠嘅力量<br><span style="color:#94A3B8;">(點擊畫面任意處即可關閉)</span></div>',
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
          console.log('%c[ 💖 放鬆完成 ] 心情沉澱好喇！用溫柔嘅語氣，陪小朋友一齊完成練習啦。', 'color:#059669; font-weight:bold; font-size:13px;');
          return;
        }

        if (secEl) secEl.innerText = sec;
        if (stageEl) {
          if (sec > 10) {
            stageEl.innerText = '慢慢深深吸氣... 🌸';
          } else if (sec > 5) {
            stageEl.innerText = '屏住呼吸... 安定思緒 🌿';
          } else {
            stageEl.innerText = '放鬆緩緩呼氣... 展現微笑 😊';
          }
        }
      }, 1000);

      return '15 秒放鬆導引已啟動。點擊螢幕可隨時關閉。';
    },

    cheer: function () {
      var rand = CHEER_QUOTES[Math.floor(Math.random() * CHEER_QUOTES.length)];
      console.log('%c[ 💌 親子溫馨錦囊 ] ' + rand, S.quote);
      return '畀個擁抱小朋友，佢今日已經做得好出色！';
    },

    reward: function () {
      var prize = REWARDS[Math.floor(Math.random() * REWARDS.length)];
      console.log('%c🎉 今日默書完成專屬獎勵：%c ' + prize, 'background:#DEF7EC; color:#03543F; font-weight:bold; padding:4px 8px; border-radius:3px;', 'color:#065F46; font-weight:800; font-size:13px;');
      return '快啲同小朋友一齊兌現呢份小獎勵啦！';
    },

    cheers: function () {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        console.log('%c🎉 默書大成功！今次辛苦晒小朋友同家長！', 'color:#4F46E5; font-weight:bold; font-size:15px;');
        return '默書完成！';
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

      console.log('%c🎊 默書大功告成！太棒喇！今晚值得全家開心慶祝！ 🥳', 'background:#10B981; color:#FFFFFF; font-size:13px; font-weight:800; padding:6px 12px; border-radius:4px;');
      return '🎉 慶祝光芒已展現！';
    }
  });

  window.kids = kidsSuite;
  window.relax = kidsSuite.relax;

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(renderTerminal, 300);
  } else {
    window.addEventListener('DOMContentLoaded', function () {
      setTimeout(renderTerminal, 300);
    });
  }
})();
