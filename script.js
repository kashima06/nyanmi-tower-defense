(function () {
  "use strict";

  const ROWS = 5;
  const COLS = 10;
  const PLACEABLE_COLS = 4;
  const COST_RECOVERY_RATE = 0.4;
  const DEFAULT_DEPLOY_COOLDOWN = 25;
  const DEPLOY_COOLDOWNS = {
    nyanmi: 30,
    leafa: 18
  };
  const SAVE_KEY = "nyanmi-defense-save-v1";
  const UNIT_MOTIONS = {
    nyanmi: { src: "assets/motion-nyanmi-cutout.png", frames: 8, columns: 4, rows: 2, duration: 0.7 },
    pastel: { src: "assets/motion-pastel-cutout.png", frames: 8, columns: 4, rows: 2, duration: 0.85 },
    leafa: { src: "assets/motion-fio-cutout.png", frames: 8, columns: 4, rows: 2, duration: 0.52 },
    lunaria: { src: "assets/motion-ria-cutout.png", frames: 8, columns: 4, rows: 2, duration: 0.82 },
    riku: { src: "assets/motion-leon-cutout.png", frames: 8, columns: 4, rows: 2, duration: 0.62 }
  };
  const ENEMY_SPRITES = {
    weak0: { src: "assets/enemy-weak-cutout.png", index: 0, columns: 4, rows: 2 },
    weak1: { src: "assets/enemy-weak-cutout.png", index: 1, columns: 4, rows: 2 },
    weak2: { src: "assets/enemy-weak-cutout.png", index: 2, columns: 4, rows: 2 },
    weak3: { src: "assets/enemy-weak-cutout.png", index: 3, columns: 4, rows: 2 },
    weak4: { src: "assets/enemy-weak-cutout.png", index: 4, columns: 4, rows: 2 },
    weak5: { src: "assets/enemy-weak-cutout.png", index: 5, columns: 4, rows: 2 },
    weak6: { src: "assets/enemy-weak-cutout.png", index: 6, columns: 4, rows: 2 },
    weak7: { src: "assets/enemy-weak-cutout.png", index: 7, columns: 4, rows: 2 },
    strong0: { src: "assets/enemy-strong-cutout.png", index: 0, columns: 4, rows: 2 },
    strong1: { src: "assets/enemy-strong-cutout.png", index: 1, columns: 4, rows: 2 },
    strong2: { src: "assets/enemy-strong-cutout.png", index: 2, columns: 4, rows: 2 },
    strong3: { src: "assets/enemy-strong-cutout.png", index: 3, columns: 4, rows: 2 },
    strong4: { src: "assets/enemy-strong-cutout.png", index: 4, columns: 4, rows: 2 },
    strong5: { src: "assets/enemy-strong-cutout.png", index: 5, columns: 4, rows: 2 },
    strong6: { src: "assets/enemy-strong-cutout.png", index: 6, columns: 4, rows: 2 },
    strong7: { src: "assets/enemy-strong-cutout.png", index: 7, columns: 4, rows: 2 }
  };
  const RESULT_POP_IMAGES = {
    success: "assets/result-defense-success.png",
    fail: "assets/result-defense-fail.png"
  };

  const unitDefs = [
    {
      id: "nyanmi",
      name: "にゃんみちゃん",
      className: "格闘家",
      cost: 12,
      hp: 5200,
      damage: 220,
      interval: 0.82,
      range: 0.6,
      shape: "around",
      circleRadius: 1.5,
      color: "#f15648",
      portrait: 0,
      projectile: "slash",
      skill: "猫拳ラッシュ",
      note: "前線で止める"
    },
    {
      id: "pastel",
      name: "パステルちゃん",
      className: "魔法使い",
      cost: 15,
      hp: 3100,
      damage: 0,
      heal: 200,
      canAttack: false,
      interval: 1.65,
      range: 2.0,
      healRange: 2,
      healShape: "cross",
      color: "#ff86cc",
      portrait: 1,
      projectile: "heal",
      skill: "パステルヒール",
      note: "回復支援"
    },
    {
      id: "yami",
      name: "闇にゃんみ",
      className: "遊撃手",
      cost: 11,
      hp: 3400,
      damage: 320,
      interval: 1.0,
      range: 3.0,
      color: "#9d63ff",
      portrait: 2,
      projectile: "shadow",
      slow: 1.4,
      skill: "シャドウステップ",
      note: "弱体奇襲"
    },
    {
      id: "lunaria",
      name: "ようへいB",
      className: "魔法使い",
      cost: 16,
      hp: 2950,
      damage: 560,
      interval: 4.06,
      range: 2,
      shape: "frontBox",
      rangeRows: 3,
      aoe: 0.62,
      color: "#54b9ff",
      portrait: 3,
      projectile: "moon",
      skill: "ムーンレイ",
      note: "範囲魔法"
    },
    {
      id: "leafa",
      name: "リーファ",
      className: "スカウト",
      cost: 10,
      hp: 3500,
      damage: 50,
      interval: 0.52,
      range: 5.0,
      pierce: true,
      color: "#71d15f",
      portrait: 4,
      projectile: "arrow",
      skill: "フォレストショット",
      note: "貫通射撃"
    },
    {
      id: "riku",
      name: "ようへいA",
      className: "戦士",
      cost: 14,
      hp: 4700,
      damage: 760,
      interval: 1.5,
      range: 1.2,
      color: "#ff8a32",
      portrait: 5,
      projectile: "slash",
      skill: "ブレイブブレイド",
      note: "近接火力"
    }
  ];

  const enemyDefs = {
    imp: {
      name: "小鬼",
      glyph: "◆",
      hp: 1500,
      speed: 0.32,
      damage: 260,
      interval: 1.05,
      reward: 3,
      spriteOptions: ["weak0", "weak1", "weak4"],
      a: "#59302a",
      b: "#1d1415"
    },
    hound: {
      name: "影獣",
      glyph: "✦",
      hp: 1200,
      speed: 0.52,
      damage: 180,
      interval: 0.82,
      reward: 3,
      spriteOptions: ["weak2", "weak3"],
      a: "#3e285a",
      b: "#120f1e"
    },
    skeleton: {
      name: "骸兵",
      glyph: "☠",
      hp: 2300,
      speed: 0.24,
      damage: 340,
      interval: 1.1,
      reward: 4,
      spriteOptions: ["weak5", "weak6", "weak7"],
      a: "#6d665b",
      b: "#2a261f"
    },
    brute: {
      name: "重装鬼",
      glyph: "♜",
      hp: 5900,
      speed: 0.18,
      damage: 500,
      interval: 1.35,
      reward: 6,
      spriteOptions: ["strong1", "strong2", "strong4"],
      spriteScale: 1.08,
      a: "#7c3a22",
      b: "#26120c"
    },
    wraith: {
      name: "闇術師",
      glyph: "✹",
      hp: 2600,
      speed: 0.28,
      damage: 420,
      interval: 1.0,
      reward: 5,
      spriteOptions: ["strong0", "strong5", "strong7"],
      a: "#6a2f8e",
      b: "#1a0f27"
    },
    dragon: {
      name: "裂界竜",
      glyph: "龍",
      hp: 12000,
      speed: 0.18,
      damage: 820,
      interval: 1.25,
      reward: 18,
      spriteOptions: ["strong3", "strong6"],
      spriteScale: 1.16,
      a: "#55226d",
      b: "#16091f",
      boss: true
    }
  };

  const stageDefs = [
    {
      id: 1,
      name: "第1ステージ 配置訓練",
      guide: "にゃんみちゃんだけで戦うチュートリアル。左4列に配置して、中央から来る敵を止めよう。",
      allowedUnits: ["nyanmi"],
      initialCost: 20,
      maxCost: 60,
      lives: 2,
      waves: [
        [
          [0.6, "imp", 2],
          [1.8, "imp", 3],
          [0.6, "imp", 1],
          [4.4, "hound", 2]
        ]
      ]
    },
    {
      id: 2,
      name: "第2ステージ 回復訓練",
      guide: "にゃんみちゃんとパステルちゃんで、高耐久の敵を受け止めよう。コストが回復したらパステルちゃんを近くに置いて回復させます。",
      allowedUnits: ["nyanmi", "pastel"],
      initialCost: 20,
      maxCost: 60,
      lives: 1,
      waves: [
        [
          [6.0, "brute", 2, 7.8]
        ]
      ]
    },
    {
      id: 3,
      name: "第3ステージ 貫通射撃訓練",
      guide: "リーファだけで戦うチュートリアル。同じ行に連続して来る敵を、貫通攻撃でまとめて射抜こう。",
      allowedUnits: ["leafa"],
      initialCost: 20,
      maxCost: 60,
      lives: 3,
      waves: [
        [
          [0.6, "hound", 2],
          [1.0, "hound", 2],
          [1.4, "hound", 2],
          [1.8, "imp", 2],
          [2.2, "imp", 2],
          [2.6, "hound", 2],
          [3.0, "imp", 2],
          [3.4, "hound", 2],
          [3.8, "imp", 2],
          [4.2, "hound", 2]
        ]
      ]
    },
    {
      id: 4,
      name: "第4ステージ みんなで防衛戦",
      guide: "全ユニット解放。これまでの役割を組み合わせて、3WAVEの総力戦を守り切ろう。",
      allowedUnits: unitDefs.map((unit) => unit.id),
      initialCost: 20,
      maxCost: 60,
      lives: 3,
      waves: [
        [
          [0.4, "imp", 0],
          [1.2, "hound", 2],
          [2.0, "imp", 4],
          [2.9, "skeleton", 1],
          [3.6, "imp", 3],
          [4.4, "hound", 0],
          [5.2, "skeleton", 4],
          [6.1, "imp", 2]
        ],
        [
          [0.5, "hound", 0],
          [0.9, "hound", 4],
          [1.8, "skeleton", 2],
          [2.4, "imp", 1],
          [3.0, "wraith", 3],
          [3.6, "brute", 0],
          [4.4, "skeleton", 4],
          [5.1, "hound", 2],
          [5.9, "wraith", 1],
          [6.7, "brute", 3]
        ],
        [
          [0.5, "skeleton", 0],
          [1.0, "hound", 1],
          [1.5, "brute", 4],
          [2.0, "wraith", 2],
          [2.7, "hound", 3],
          [3.4, "brute", 1],
          [4.2, "wraith", 4],
          [4.8, "skeleton", 3],
          [5.4, "dragon", 2],
          [6.2, "hound", 0],
          [6.9, "wraith", 1],
          [7.8, "brute", 4]
        ]
      ]
    }
  ];

  const storySequences = {
    pre: {
      0: {
        kicker: "STAGE 1",
        title: "はじまりの防衛ライン",
        image: "assets/episode-stage1.png",
        doneLabel: "編成へ",
        pages: [
          {
            title: "村の入口",
            body: [
              "村の入口に、小さな防衛ラインが築かれていた。",
              "村人たちを背にして、にゃんみちゃんはひとり前に立つ。",
              "空の亀裂から現れたのは、見たことない異形のモンスターだった。"
            ]
          },
          {
            title: "配置の基本",
            body: [
              "ユニットを左側のマスに配置して、右から左へ進む敵を止めましょう。",
              "敵が左端の防衛ラインに到達すると、ライフが減ります。",
              "前線に置いた仲間は敵を足止めできます。"
            ]
          },
          {
            title: "周囲を守る拳",
            body: [
              "にゃんみちゃんは、自分の周囲1マスを攻撃できます。",
              "敵が集まりやすい場所に配置しましょう。"
            ],
            diagram: "★★★\n★●★\n★★★"
          }
        ]
      },
      1: {
        kicker: "STAGE 2",
        title: "祈りの光と押し寄せる影",
        image: "assets/episode-stage2.png",
        doneLabel: "編成へ",
        pages: [
          {
            title: "街道の声",
            body: [
              "遠くの街道から、助けを呼ぶ声が聞こえた。",
              "にゃんみちゃんが駆けつけると、逃げる人々のそばでパステルちゃんが祈りの魔法を使っていた。",
              "彼女は傷ついた人を放っておけず、ひとりでその場に残っていた。"
            ]
          },
          {
            title: "ふたりで守る",
            body: [
              "にゃんみちゃん「大丈夫！？ 今助けるよ！」",
              "パステルちゃん「わたし、攻撃は得意じゃないけど……支えることならできる！」",
              "前衛が敵を止め続けるには、回復の支えが必要です。"
            ]
          },
          {
            title: "パステルちゃんの回復範囲",
            body: [
              "パステルちゃんは、十字範囲2マスの味方を回復できます。",
              "前線を支えられる位置に配置しましょう。"
            ],
            diagram: "　　★\n　　★\n★★●★★\n　　★\n　　★"
          }
        ]
      },
      2: {
        kicker: "STAGE 3",
        title: "森を抜ける光の矢",
        image: "assets/episode-stage3.png",
        doneLabel: "編成へ",
        pages: [
          {
            title: "森の弓使い",
            body: [
              "深い森にも、空の亀裂は開いていた。",
              "森に住む弓使いリーファは、散り散りになった仲間を逃がすため、ひとりで異形を引きつけている。",
              "リーファはまだ、にゃんみちゃんたちを知らない。"
            ]
          },
          {
            title: "まとめて抜く",
            body: [
              "敵は細い道を、一直線に群れで迫ってくる。",
              "リーファ「……まとめて来るなら、まとめて抜く」",
              "光の矢は前方へ長く届き、同じ列の敵を貫きます。"
            ],
            diagram: "●★★★★★"
          },
          {
            title: "遠距離の戦い方",
            body: [
              "遠距離ユニットは後方から攻撃できます。",
              "敵が届く前に倒す立ち回りが重要です。",
              "同じ列に敵が多いほど、リーファの貫通攻撃は力を発揮します。"
            ]
          }
        ]
      }
    },
    post: {
      0: {
        kicker: "AFTER STAGE 1",
        title: "まだ閉じない亀裂",
        image: "assets/episode-stage1.png",
        doneLabel: "閉じる",
        pages: [
          {
            title: "最初の防衛",
            body: [
              "にゃんみちゃんは、なんとか最初の異形を退けた。",
              "村人たちは助かった。けれど、空の亀裂は閉じない。",
              "にゃんみちゃんは空を見上げる。"
            ]
          },
          {
            title: "次の声",
            body: [
              "にゃんみちゃん「これ……まだ終わってないよね？」",
              "その時、遠くの街道から助けを呼ぶ声が聞こえた。",
              "小さな防衛ラインの戦いは、まだ始まったばかりだった。"
            ]
          }
        ]
      },
      1: {
        kicker: "AFTER STAGE 2",
        title: "ふたりなら",
        image: "assets/episode-stage2.png",
        doneLabel: "閉じる",
        pages: [
          {
            title: "安心の光",
            body: [
              "敵を退けたあと、パステルちゃんは少しだけ息をついた。",
              "パステルちゃん「ひとりじゃ、守りきれないと思ってた……」",
              "にゃんみちゃんは笑って、手を差し出した。"
            ]
          },
          {
            title: "森の奥へ",
            body: [
              "にゃんみちゃん「じゃあ、ふたりで守ろ！」",
              "パステルちゃんが仲間になった。",
              "けれど空の亀裂は、森の奥へも広がっていた。"
            ]
          }
        ]
      },
      2: {
        kicker: "AFTER STAGE 3",
        title: "赤い光の方角へ",
        image: "assets/episode-stage3.png",
        doneLabel: "閉じる",
        pages: [
          {
            title: "森を抜けて",
            body: [
              "リーファは異形を退けたが、森の奥からさらに大きな気配を感じた。",
              "その時、遠くの空に赤い光が走る。",
              "それは、にゃんみちゃん達が放った戦いの光だった。"
            ]
          },
          {
            title: "まだ知らない仲間",
            body: [
              "リーファ「あの光……あっちでも誰かが戦ってる…」",
              "リーファは弓を握り直し、森を抜ける。",
              "光の方角で、次の防衛戦が待っている。"
            ]
          }
        ]
      }
    }
  };

  const els = {
    titleScreen: document.getElementById("titleScreen"),
    gameShell: document.getElementById("gameShell"),
    newGameButton: document.getElementById("newGameButton"),
    continueButton: document.getElementById("continueButton"),
    grid: document.getElementById("gridLayer"),
    range: document.getElementById("rangeLayer"),
    entities: document.getElementById("entityLayer"),
    effects: document.getElementById("effectLayer"),
    roster: document.getElementById("unitRoster"),
    skillStrip: document.getElementById("skillStrip"),
    stageText: document.getElementById("stageText"),
    waveText: document.getElementById("waveText"),
    lifeText: document.getElementById("lifeText"),
    costText: document.getElementById("costText"),
    selectedText: document.getElementById("selectedText"),
    skillHint: document.getElementById("skillHint"),
    enemyText: document.getElementById("enemyText"),
    goalBar: document.getElementById("goalBar"),
    stageTitle: document.getElementById("stageTitle"),
    stageGuide: document.getElementById("stageGuide"),
    logPanel: document.getElementById("logPanel"),
    toast: document.getElementById("toast"),
    resultPop: document.getElementById("resultPop"),
    startButton: document.getElementById("startButton"),
    speedButton: document.getElementById("speedButton"),
    pauseButton: document.getElementById("pauseButton"),
    resetButton: document.getElementById("resetButton"),
    storyOverlay: document.getElementById("storyOverlay"),
    storyImage: document.getElementById("storyImage"),
    storyKicker: document.getElementById("storyKicker"),
    storyTitle: document.getElementById("storyTitle"),
    storyBody: document.getElementById("storyBody"),
    storyProgress: document.getElementById("storyProgress"),
    storyPrevButton: document.getElementById("storyPrevButton"),
    storySkipButton: document.getElementById("storySkipButton"),
    storyNextButton: document.getElementById("storyNextButton")
  };

  const unitById = Object.fromEntries(unitDefs.map((unit) => [unit.id, unit]));
  let idCounter = 0;
  let lastFrame = performance.now();
  let toastTimer = 0;
  let resultPopDismiss = null;
  let activeStory = null;

  const state = {
    selectedUnit: "nyanmi",
    stageIndex: 0,
    cost: 20,
    maxCost: 60,
    lives: 10,
    waveIndex: 0,
    running: false,
    paused: false,
    speed: 1,
    queue: [],
    spawnClock: 0,
    enemySerial: 0,
    waveActive: false,
    intermission: 0,
    gameOver: false,
    victory: false,
    campaignCleared: false,
    hoveredUnitId: null,
    units: Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
    enemies: [],
    projectiles: [],
    effects: [],
    deployCooldowns: {},
    logs: []
  };

  function uid(prefix) {
    idCounter += 1;
    return `${prefix}-${idCounter}`;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function htmlEscape(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function log(message) {
    state.logs.unshift(message);
    state.logs = state.logs.slice(0, 9);
    els.logPanel.innerHTML = state.logs.map((line) => `<p>${htmlEscape(line)}</p>`).join("");
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.toast.classList.remove("is-visible");
    }, 1600);
  }

  function hideResultPop(runDismiss = true) {
    const onDismiss = resultPopDismiss;
    resultPopDismiss = null;
    els.resultPop.className = "result-pop";
    els.resultPop.removeAttribute("aria-label");
    els.resultPop.textContent = "";
    if (runDismiss && onDismiss) onDismiss();
  }

  function showResultPop(message, type, onDismiss = null) {
    hideResultPop(false);
    resultPopDismiss = onDismiss;
    const card = document.createElement("div");
    card.className = "result-pop__card";
    const image = document.createElement("img");
    image.className = "result-pop__image";
    image.src = RESULT_POP_IMAGES[type];
    image.alt = message;
    card.appendChild(image);
    els.resultPop.appendChild(card);
    els.resultPop.setAttribute("aria-label", `${message}。クリックで閉じます。`);
    void els.resultPop.offsetWidth;
    els.resultPop.className = `result-pop is-visible is-${type}`;
    els.resultPop.focus({ preventScroll: true });
  }

  function getStorySequence(kind, stageIndex) {
    return storySequences[kind] ? storySequences[kind][stageIndex] : null;
  }

  function openStory(kind, stageIndex, onComplete = () => {}) {
    const sequence = getStorySequence(kind, stageIndex);
    if (!sequence) {
      onComplete();
      return;
    }

    activeStory = {
      kind,
      stageIndex,
      sequence,
      pageIndex: 0,
      onComplete
    };
    els.storyOverlay.classList.add("is-open");
    document.body.classList.add("is-story-open");
    renderStoryPage();
  }

  function closeStory() {
    if (!activeStory) return;
    const onComplete = activeStory.onComplete;
    activeStory = null;
    els.storyOverlay.classList.remove("is-open");
    document.body.classList.remove("is-story-open");
    onComplete();
  }

  function renderStoryPage() {
    if (!activeStory) return;
    const { sequence, pageIndex } = activeStory;
    const page = sequence.pages[pageIndex];
    const image = page.image || sequence.image;
    const body = (page.body || [])
      .map((paragraph) => `<p>${htmlEscape(paragraph)}</p>`)
      .join("");
    const points = page.points
      ? `<ul>${page.points.map((point) => `<li>${htmlEscape(point)}</li>`).join("")}</ul>`
      : "";
    const diagram = page.diagram ? `<pre class="story-range">${htmlEscape(page.diagram)}</pre>` : "";

    els.storyImage.src = image;
    els.storyImage.alt = sequence.title;
    els.storyKicker.textContent = sequence.kicker || "EPISODE";
    els.storyTitle.textContent = page.title || sequence.title;
    els.storyBody.innerHTML = body + points + diagram;
    els.storyProgress.textContent = `${pageIndex + 1} / ${sequence.pages.length}`;
    els.storyPrevButton.disabled = pageIndex === 0;
    els.storyNextButton.textContent = pageIndex === sequence.pages.length - 1
      ? (sequence.doneLabel || "閉じる")
      : "次へ";
  }

  function moveStory(delta) {
    if (!activeStory) return;
    const next = activeStory.pageIndex + delta;
    if (next < 0) return;
    if (next >= activeStory.sequence.pages.length) {
      closeStory();
      return;
    }
    activeStory.pageIndex = next;
    renderStoryPage();
  }

  function currentStage() {
    return stageDefs[state.stageIndex];
  }

  function currentWaves() {
    return currentStage().waves;
  }

  function availableUnitIds() {
    return currentStage().allowedUnits;
  }

  function availableUnitDefs() {
    const allowed = new Set(availableUnitIds());
    return unitDefs.filter((unit) => allowed.has(unit.id));
  }

  function isUnitAvailable(unitId) {
    return availableUnitIds().includes(unitId);
  }

  function getDeployCooldown(unitId) {
    return Math.max(0, state.deployCooldowns[unitId] || 0);
  }

  function getDeployCooldownDuration(unitId) {
    return DEPLOY_COOLDOWNS[unitId] || DEFAULT_DEPLOY_COOLDOWN;
  }

  function updateDeployCooldowns(dt) {
    let changed = false;
    for (const unitId of Object.keys(state.deployCooldowns)) {
      const next = Math.max(0, state.deployCooldowns[unitId] - dt);
      if (next <= 0) {
        delete state.deployCooldowns[unitId];
      } else {
        state.deployCooldowns[unitId] = next;
      }
      changed = true;
    }
    return changed;
  }

  function createGrid() {
    els.grid.innerHTML = "";
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = `cell ${col < PLACEABLE_COLS ? "placeable" : "blocked"}`;
        cell.dataset.row = String(row);
        cell.dataset.col = String(col);
        cell.setAttribute("aria-label", `${row + 1}行 ${col + 1}列`);
        cell.addEventListener("click", () => placeUnit(row, col));
        els.grid.appendChild(cell);
      }
    }
  }

  function renderRoster() {
    els.roster.innerHTML = availableUnitDefs()
      .map((unit) => {
        return `
          <button class="unit-card" type="button" data-unit="${unit.id}" style="--unit-color:${unit.color}">
            <span class="unit-token p-${unit.portrait}" aria-hidden="true"></span>
            <span>
              <b>${unit.name}</b>
              <small>${unit.className} / ${unit.skill}</small>
            </span>
            <span class="cost-badge">コスト${unit.cost}</span>
            <span class="deploy-badge" aria-hidden="true"></span>
          </button>
        `;
      })
      .join("");

    els.roster.querySelectorAll(".unit-card").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedUnit = button.dataset.unit;
        updateHud();
      });
    });
  }

  function updateHud() {
    if (!isUnitAvailable(state.selectedUnit)) {
      state.selectedUnit = availableUnitIds()[0];
    }
    const selected = unitById[state.selectedUnit];
    const stage = currentStage();
    const waves = currentWaves();
    els.stageText.textContent = `${state.stageIndex + 1}/${stageDefs.length}`;
    els.waveText.textContent = `${Math.min(state.waveIndex + 1, waves.length)}/${waves.length}`;
    els.lifeText.textContent = String(state.lives);
    els.costText.textContent = `${Math.floor(state.cost)}/${state.maxCost}`;
    els.selectedText.textContent = `${selected.name}選択中`;
    els.enemyText.textContent = String(state.queue.length + state.enemies.length);
    els.stageTitle.textContent = stage.name;
    els.stageGuide.textContent = stage.guide;
    const maxLives = stage.lives || 10;
    els.goalBar.style.setProperty("--goal", `${clamp((state.lives / maxLives) * 100, 0, 100)}%`);
    els.pauseButton.textContent = state.paused ? "▶" : "Ⅱ";
    els.startButton.textContent = getStartButtonText();
    els.startButton.disabled = state.running && !state.gameOver && !state.victory;
    els.speedButton.textContent = `×${state.speed}`;
    document.body.classList.toggle("is-running", state.running);

    els.roster.querySelectorAll(".unit-card").forEach((button) => {
      const def = unitById[button.dataset.unit];
      const deployCooldown = getDeployCooldown(def.id);
      const isCooling = deployCooldown > 0;
      const badge = button.querySelector(".cost-badge");
      const deployBadge = button.querySelector(".deploy-badge");
      button.classList.toggle("is-selected", state.selectedUnit === def.id);
      button.classList.toggle("is-cooling", isCooling);
      if (badge) {
        badge.textContent = `コスト${def.cost}`;
      }
      if (deployBadge) {
        deployBadge.textContent = isCooling ? `再${Math.ceil(deployCooldown)}秒` : "";
      }
      button.disabled = state.gameOver || state.victory || !isUnitAvailable(def.id) || state.cost < def.cost || isCooling;
    });
  }

  function getStartButtonText() {
    if (state.gameOver) return "再挑戦";
    if (state.victory && state.campaignCleared) return "最初から";
    if (state.victory) return "次のステージへ";
    if (state.running) return "進行中";
    return "出撃開始";
  }

  function getUnits() {
    return state.units.flat().filter(Boolean);
  }

  function placeUnit(row, col) {
    if (state.gameOver || state.victory) {
      showToast("再挑戦で新しい防衛線を組めます");
      return;
    }

    if (col >= PLACEABLE_COLS) {
      showToast("味方は左4列へ配置できます");
      flashCell(row, col);
      return;
    }

    if (state.units[row][col]) {
      showToast("このマスには既に仲間がいます");
      flashCell(row, col);
      return;
    }

    const def = unitById[state.selectedUnit];
    if (!def || !isUnitAvailable(def.id)) {
      showToast("このステージではまだ出撃できません");
      return;
    }
    if (state.cost < def.cost) {
      showToast("コストが足りません");
      return;
    }
    const deployCooldown = getDeployCooldown(def.id);
    if (deployCooldown > 0) {
      showToast(`${def.name}は再配置まで${Math.ceil(deployCooldown)}秒`);
      return;
    }

    const unit = {
      id: uid("unit"),
      type: def.id,
      row,
      col,
      hp: def.hp,
      maxHp: def.hp,
      cooldown: 0.25,
      skill: 18,
      attackTimer: 0,
      attackDuration: 0
    };
    state.units[row][col] = unit;
    state.cost -= def.cost;
    state.deployCooldowns[def.id] = getDeployCooldownDuration(def.id);
    addEffect(col + 0.5, row + 0.5, "配置", def.color);
    log(`${def.name}を${row + 1}行${col + 1}列に配置`);
    updateHud();
    saveGameState();
    draw();
  }

  function flashCell(row, col) {
    const selector = `.cell[data-row="${row}"][data-col="${col}"]`;
    const cell = els.grid.querySelector(selector);
    if (!cell) return;
    cell.classList.add("is-target");
    setTimeout(() => cell.classList.remove("is-target"), 280);
  }

  function startButtonAction() {
    if (state.gameOver) {
      resetGame(state.stageIndex);
      return;
    }
    if (state.victory) {
      const nextStageIndex = state.campaignCleared ? 0 : state.stageIndex + 1;
      resetGame(nextStageIndex);
      saveGameState();
      openStory("pre", nextStageIndex);
      return;
    }
    if (!state.running) {
      state.running = true;
      state.paused = false;
      startWave();
      updateHud();
      saveGameState();
    }
  }

  function startWave() {
    state.queue = currentWaves()[state.waveIndex].map(([at, type, row, spawnX]) => ({ at, type, row, spawnX }));
    state.spawnClock = 0;
    state.waveActive = true;
    state.intermission = 0;
    log(`${currentStage().name} WAVE ${state.waveIndex + 1} 開始`);
  }

  function chooseEnemySprite(def) {
    const options = def.spriteOptions || [];
    if (options.length === 0) return null;
    const sprite = options[state.enemySerial % options.length];
    state.enemySerial += 1;
    return sprite;
  }

  function spawnEnemy(type, row, spawnX = COLS + 0.16) {
    const def = enemyDefs[type];
    state.enemies.push({
      id: uid("enemy"),
      type,
      sprite: chooseEnemySprite(def),
      row,
      x: spawnX,
      hp: def.hp,
      maxHp: def.hp,
      attackCooldown: 0.5,
      slow: 0
    });
    addEffect(Math.min(spawnX, COLS - 0.25), row + 0.5, def.name, "#ff8f78");
  }

  function update(dt) {
    const cooldownChanged = !state.paused && !state.gameOver && !state.victory
      ? updateDeployCooldowns(dt)
      : false;
    if (!state.running || state.paused || state.gameOver || state.victory) {
      if (cooldownChanged) updateHud();
      return;
    }

    state.cost = clamp(state.cost + dt * COST_RECOVERY_RATE, 0, state.maxCost);
    updateWave(dt);
    updateEnemies(dt);
    updateUnits(dt);
    updateProjectiles(dt);
    updateEffects(dt);
    cleanDead();
    checkEndStates(dt);
    updateHud();
  }

  function updateWave(dt) {
    if (!state.waveActive) return;
    state.spawnClock += dt;
    while (state.queue.length > 0 && state.queue[0].at <= state.spawnClock) {
      const next = state.queue.shift();
      spawnEnemy(next.type, next.row, next.spawnX);
    }
  }

  function updateEnemies(dt) {
    for (const enemy of state.enemies) {
      const def = enemyDefs[enemy.type];
      enemy.slow = Math.max(0, enemy.slow - dt);
      const blocker = findBlocker(enemy);
      if (blocker) {
        enemy.x = Math.max(enemy.x, blocker.col + 0.78);
        enemy.attackCooldown -= dt;
        if (enemy.attackCooldown <= 0) {
          const damage = def.damage;
          blocker.hp -= damage;
          addEffect(blocker.col + 0.5, blocker.row + 0.5, `-${damage}`, "#ff6b5c");
          enemy.attackCooldown = def.interval;
        }
      } else {
        const slowFactor = enemy.slow > 0 ? 0.52 : 1;
        enemy.x -= def.speed * slowFactor * dt;
      }

      if (enemy.x < -0.18) {
        enemy.escaped = true;
        state.lives -= enemyDefs[enemy.type].boss ? 3 : 1;
        addEffect(0.25, enemy.row + 0.5, "突破", "#ff4a3f");
        log(`${enemyDefs[enemy.type].name}が防衛ラインを突破`);
      }
    }
  }

  function findBlocker(enemy) {
    const rowUnits = state.units[enemy.row].filter(Boolean);
    return rowUnits
      .filter((unit) => enemy.x <= unit.col + 1.05 && enemy.x >= unit.col + 0.34)
      .sort((a, b) => b.col - a.col)[0];
  }

  function updateUnits(dt) {
    for (const unit of getUnits()) {
      const def = unitById[unit.type];
      unit.attackTimer = Math.max(0, (unit.attackTimer || 0) - dt);
      unit.cooldown -= dt;
      unit.skill = clamp(unit.skill + dt * 6.5, 0, 100);
      if (unit.cooldown > 0) continue;

      if (def.heal) {
        const ally = findWoundedAlly(unit, def);
        if (ally) {
          healUnit(unit, ally, def.heal);
          unit.cooldown = def.interval;
          unit.skill = clamp(unit.skill + 4, 0, 100);
          continue;
        }
        if (def.canAttack === false) {
          continue;
        }
      }

      const target = findTarget(unit, def);
      if (!target) continue;
      fireAt(unit, target, def);
      unit.cooldown = def.interval;
      unit.skill = clamp(unit.skill + 8, 0, 100);
    }
  }

  function triggerAttackMotion(unit, def, scale = 1) {
    const motion = UNIT_MOTIONS[def.id];
    const duration = (motion ? motion.duration : 0.34) * scale;
    unit.attackTimer = duration;
    unit.attackDuration = duration;
  }

  function findWoundedAlly(unit, def) {
    return getUnits()
      .filter((ally) => ally.hp < ally.maxHp)
      .filter((ally) => isInHealRange(unit, def, ally))
      .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
  }

  function isInHealRange(source, def, ally) {
    const range = def.healRange ?? def.range;
    if (def.healShape === "cross") {
      const colDistance = Math.abs(ally.col - source.col);
      const rowDistance = Math.abs(ally.row - source.row);
      return (
        (colDistance === 0 && rowDistance <= range) ||
        (rowDistance === 0 && colDistance <= range)
      );
    }

    return distance(source.col + 0.5, source.row + 0.5, ally.col + 0.5, ally.row + 0.5) <= range;
  }

  function healUnit(source, target, amount) {
    const def = unitById[source.type];
    triggerAttackMotion(source, def);
    target.hp = clamp(target.hp + amount, 0, target.maxHp);
    addEffect(target.col + 0.5, target.row + 0.5, `+${amount}`, "#9dff9f");
    state.projectiles.push({
      id: uid("proj"),
      kind: "heal",
      x: source.col + 0.5,
      y: source.row + 0.5,
      sx: source.col + 0.5,
      sy: source.row + 0.5,
      tx: target.col + 0.5,
      ty: target.row + 0.5,
      t: 0,
      duration: 0.32,
      color: def.color
    });
  }

  function findTarget(unit, def) {
    return findTargets(unit, def)[0];
  }

  function findTargets(unit, def) {
    return state.enemies
      .filter((enemy) => enemy.hp > 0 && !enemy.escaped)
      .filter((enemy) => isInAttackRange(unit, def, enemy))
      .sort((a, b) => a.x - b.x);
  }

  function isInAttackRange(unit, def, enemy) {
    const ex = enemy.x;
    const ey = enemy.row + 0.5;
    const ux = unit.col + 0.5;
    const uy = unit.row + 0.5;

    if (def.shape === "around") {
      return distance(ux, uy, ex, ey) <= (def.circleRadius || 1.5);
    }

    if (def.shape === "frontBox") {
      const rowReach = Math.floor((def.rangeRows || 3) / 2);
      return (
        enemy.row >= unit.row - rowReach &&
        enemy.row <= unit.row + rowReach &&
        ex >= unit.col + 1 &&
        ex <= unit.col + 1 + def.range
      );
    }

    if (def.range <= 1.7) {
      return enemy.row === unit.row && ex >= unit.col - 0.1 && ex <= unit.col + def.range;
    }

    return enemy.row === unit.row && ex >= unit.col - 0.2 && distance(ux, uy, ex, ey) <= def.range;
  }

  function fireAt(unit, target, def) {
    const startX = unit.col + 0.5;
    const startY = unit.row + 0.5;
    triggerAttackMotion(unit, def);
    if (def.projectile === "slash") {
      const targets = def.shape === "around" ? findTargets(unit, def) : [target];
      for (const hit of targets) {
        applyDamage(hit, def.damage, def);
        state.projectiles.push({
          id: uid("proj"),
          kind: "slash",
          x: (startX + hit.x) / 2,
          y: startY,
          sx: startX,
          sy: startY,
          tx: hit.x,
          ty: hit.row + 0.5,
          t: 0,
          duration: 0.16,
          color: def.color
        });
      }
      if (targets.length > 1) {
        addEffect(unit.col + 0.5, unit.row + 0.5, "範囲", def.color);
      }
      return;
    }

    if (def.pierce) {
      state.projectiles.push({
        id: uid("proj"),
        kind: def.projectile,
        source: unit.id,
        damage: def.damage,
        pierce: true,
        row: unit.row,
        minX: startX,
        maxX: clamp(unit.col + def.range, 0, COLS),
        x: startX,
        y: startY,
        sx: startX,
        sy: startY,
        tx: clamp(unit.col + def.range, 0, COLS),
        ty: startY,
        t: 0,
        duration: 0.3,
        color: def.color
      });
      return;
    }

    state.projectiles.push({
      id: uid("proj"),
      kind: def.projectile,
      source: unit.id,
      target: target.id,
      damage: def.damage,
      aoe: def.aoe || 0,
      slow: def.slow || 0,
      x: startX,
      y: startY,
      sx: startX,
      sy: startY,
      tx: target.x,
      ty: target.row + 0.5,
      t: 0,
      duration: def.projectile === "arrow" ? 0.22 : 0.36,
      color: def.color
    });
  }

  function updateProjectiles(dt) {
    for (const projectile of state.projectiles) {
      projectile.t += dt / projectile.duration;
      if (projectile.target) {
        const target = state.enemies.find((enemy) => enemy.id === projectile.target);
        if (target) {
          projectile.tx = target.x;
          projectile.ty = target.row + 0.5;
        }
      }
      const t = clamp(projectile.t, 0, 1);
      projectile.x = projectile.sx + (projectile.tx - projectile.sx) * easeOut(t);
      projectile.y = projectile.sy + (projectile.ty - projectile.sy) * easeOut(t);
      if (projectile.t >= 1 && !projectile.done) {
        projectile.done = true;
        if (projectile.damage) {
          if (projectile.pierce) {
            hitPiercingTargets(projectile);
          } else {
            const target = state.enemies.find((enemy) => enemy.id === projectile.target);
            if (target) {
              hitTarget(projectile, target);
            }
          }
        }
      }
    }
    state.projectiles = state.projectiles.filter((projectile) => projectile.t < 1.08);
  }

  function hitPiercingTargets(projectile) {
    let hits = 0;
    for (const enemy of state.enemies) {
      const inLine =
        enemy.hp > 0 &&
        !enemy.escaped &&
        enemy.row === projectile.row &&
        enemy.x >= projectile.minX - 0.1 &&
        enemy.x <= projectile.maxX + 0.15;
      if (inLine) {
        hits += 1;
        applyDamage(enemy, projectile.damage, projectile);
      }
    }
    if (hits > 1) {
      addEffect(projectile.maxX - 0.3, projectile.row + 0.5, "貫通", projectile.color);
    }
  }

  function hitTarget(projectile, target) {
    if (projectile.aoe > 0) {
      for (const enemy of state.enemies) {
        const inRange = distance(enemy.x, enemy.row + 0.5, target.x, target.row + 0.5) <= projectile.aoe;
        if (inRange) applyDamage(enemy, projectile.damage, projectile);
      }
      addEffect(target.x, target.row + 0.5, "範囲", projectile.color);
    } else {
      applyDamage(target, projectile.damage, projectile);
    }
    if (projectile.slow) {
      target.slow = Math.max(target.slow, projectile.slow);
    }
  }

  function applyDamage(enemy, amount, source) {
    const damage = Math.round(amount);
    enemy.hp -= damage;
    addEffect(enemy.x, enemy.row + 0.45, `${damage}`, source.color || "#ffe078");
    if (source.slow) {
      enemy.slow = Math.max(enemy.slow, source.slow);
    }
  }

  function updateEffects(dt) {
    for (const effect of state.effects) {
      effect.life -= dt;
    }
    state.effects = state.effects.filter((effect) => effect.life > 0);
  }

  function cleanDead() {
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const unit = state.units[row][col];
        if (unit && unit.hp <= 0) {
          const def = unitById[unit.type];
          state.units[row][col] = null;
          addEffect(col + 0.5, row + 0.5, "撤退", "#ff6b5c");
          log(`${def.name}が撤退`);
        }
      }
    }

    for (const enemy of state.enemies) {
      if (enemy.hp <= 0 && !enemy.counted) {
        enemy.counted = true;
        const def = enemyDefs[enemy.type];
        state.cost = clamp(state.cost + def.reward, 0, state.maxCost);
        addEffect(enemy.x, enemy.row + 0.5, `+${def.reward}`, "#fff08a");
      }
    }
    state.enemies = state.enemies.filter((enemy) => enemy.hp > 0 && !enemy.escaped);
  }

  function checkEndStates(dt) {
    if (state.lives <= 0) {
      state.gameOver = true;
      state.running = false;
      log("防衛ラインが突破されました");
      showResultPop("防衛失敗・・・", "fail");
      showToast("敗北。再挑戦で編成し直せます");
      return;
    }

    if (state.waveActive && state.queue.length === 0 && state.enemies.length === 0) {
      state.waveActive = false;
      state.waveIndex += 1;
      if (state.waveIndex >= currentWaves().length) {
        state.victory = true;
        state.running = false;
        state.campaignCleared = state.stageIndex >= stageDefs.length - 1;
        const completedStageIndex = state.stageIndex;
        log(`${currentStage().name} クリア`);
        showResultPop("防衛成功♬", "success", () => {
          if (state.victory && state.stageIndex === completedStageIndex) {
            openStory("post", completedStageIndex);
          }
        });
        if (state.campaignCleared) {
          showToast("全ステージクリア！防衛ラインを守り切りました");
          saveGameState();
        } else {
          showToast(`${currentStage().name} クリア！次のステージへ進めます`);
          saveStageStart(state.stageIndex + 1);
        }
      } else {
        state.intermission = 2.2;
        state.maxCost += 18;
        state.cost = clamp(state.cost + 20, 0, state.maxCost);
        log(`WAVE ${state.waveIndex} 防衛成功。次の波に備えます`);
        saveGameState();
      }
    }

    if (!state.waveActive && state.running && state.intermission > 0) {
      state.intermission -= dt;
      if (state.intermission <= 0) {
        startWave();
      }
    }
  }

  function addEffect(x, y, text, color) {
    state.effects.push({
      id: uid("fx"),
      x,
      y,
      text,
      color,
      life: 0.88,
      maxLife: 0.88
    });
  }

  function distance(ax, ay, bx, by) {
    return Math.hypot(ax - bx, ay - by);
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function getUnitMotionFrame(unit, motion) {
    if (!unit.attackTimer) return 0;
    const duration = unit.attackDuration || motion.duration;
    const progress = clamp(1 - unit.attackTimer / duration, 0, 0.999);
    return 1 + Math.min(motion.frames - 2, Math.floor(progress * (motion.frames - 1)));
  }

  function renderUnitSprite(unit, def) {
    const motion = UNIT_MOTIONS[def.id];
    if (!motion) {
      return `<div class="unit-sprite fallback p-${def.portrait}" data-frame="idle"></div>`;
    }

    const frame = getUnitMotionFrame(unit, motion);
    const col = frame % motion.columns;
    const row = Math.floor(frame / motion.columns);
    const sheetX = motion.columns <= 1 ? 0 : (col / (motion.columns - 1)) * 100;
    const sheetY = motion.rows <= 1 ? 0 : (row / (motion.rows - 1)) * 100;

    return `
      <div
        class="unit-sprite has-motion"
        data-frame="${frame}"
        style="background-image:url('${motion.src}');--sheet-x:${sheetX}%;--sheet-y:${sheetY}%"
      ></div>
    `;
  }

  function renderEnemySprite(enemy, def) {
    const sprite = ENEMY_SPRITES[enemy.sprite] || ENEMY_SPRITES[(def.spriteOptions || [])[0]];
    if (!sprite) {
      return `<div class="enemy-body">${def.glyph}</div>`;
    }

    const col = sprite.index % sprite.columns;
    const row = Math.floor(sprite.index / sprite.columns);
    const sheetX = sprite.columns <= 1 ? 0 : (col / (sprite.columns - 1)) * 100;
    const sheetY = sprite.rows <= 1 ? 0 : (row / (sprite.rows - 1)) * 100;

    return `
      <div
        class="enemy-sprite"
        style="background-image:url('${sprite.src}');--sheet-x:${sheetX}%;--sheet-y:${sheetY}%;--enemy-scale:${def.spriteScale || 1}"
      ></div>
    `;
  }

  function draw() {
    const units = getUnits()
      .map((unit) => {
        const def = unitById[unit.type];
        const x = ((unit.col + 0.5) / COLS) * 100;
        const y = ((unit.row + 0.55) / ROWS) * 100;
        const hp = clamp((unit.hp / unit.maxHp) * 100, 0, 100);
        const ready = unit.skill >= 100 ? '<span class="skill-glow"></span>' : "";
        const attacking = unit.attackTimer > 0 ? " is-attacking" : "";
        const sprite = renderUnitSprite(unit, def);
        return `
          <div class="entity unit${attacking}" data-class="${def.className}" data-unit-id="${unit.id}" style="--x:${x}%;--y:${y}%;--unit-color:${def.color};--hp:${hp}%">
            ${ready}
            <div class="hp-bar"><i></i></div>
            ${sprite}
          </div>
        `;
      })
      .join("");

    const enemies = state.enemies
      .map((enemy) => {
        const def = enemyDefs[enemy.type];
        const x = (enemy.x / COLS) * 100;
        const y = ((enemy.row + 0.55) / ROWS) * 100;
        const hp = clamp((enemy.hp / enemy.maxHp) * 100, 0, 100);
        const classes = ["entity enemy", def.boss ? "boss" : "", enemy.slow > 0 ? "slowed" : ""]
          .filter(Boolean)
          .join(" ");
        const sprite = renderEnemySprite(enemy, def);
        return `
          <div class="${classes}" style="--x:${x}%;--y:${y}%;--hp:${hp}%;--enemy-a:${def.a};--enemy-b:${def.b}">
            <div class="hp-bar"><i></i></div>
            ${sprite}
          </div>
        `;
      })
      .join("");

    const projectiles = state.projectiles
      .map((projectile) => {
        const x = (projectile.x / COLS) * 100;
        const y = (projectile.y / ROWS) * 100;
        const kindClass = projectile.kind === "slash" ? " slash" : "";
        return `<span class="projectile${kindClass}" style="--x:${x}%;--y:${y}%;--color:${projectile.color}"></span>`;
      })
      .join("");

    els.entities.innerHTML = units + enemies + projectiles;
    els.range.innerHTML = renderRangePreview();

    els.effects.innerHTML = state.effects
      .map((effect) => {
        const x = (effect.x / COLS) * 100;
        const y = (effect.y / ROWS) * 100;
        const alpha = clamp(effect.life / effect.maxLife, 0, 1);
        const rise = (1 - alpha) * 28;
        return `
          <span class="float-text" style="--x:${x}%;--y:${y}%;--alpha:${alpha};--rise:${rise}px;--color:${effect.color}">
            ${htmlEscape(effect.text)}
          </span>
        `;
      })
      .join("");

    renderSkills();
  }

  function renderRangePreview() {
    if (!state.hoveredUnitId) return "";
    const unit = getUnits().find((candidate) => candidate.id === state.hoveredUnitId);
    if (!unit) {
      state.hoveredUnitId = null;
      return "";
    }

    const def = unitById[unit.type];
    const preview = getRangePreviewRect(unit, def);
    const leftCell = preview.left;
    const topCell = preview.top;
    const widthCells = preview.width;
    const heightCells = preview.height;
    const left = (leftCell / COLS) * 100;
    const top = (topCell / ROWS) * 100;
    const width = (widthCells / COLS) * 100;
    const height = (heightCells / ROWS) * 100;
    const shapeClass = preview.shape ? ` is-${preview.shape}` : "";

    return `
      <div
        class="range-preview${shapeClass}"
        style="--left:${left}%;--top:${top}%;--width:${width}%;--height:${height}%;--unit-color:${def.color}"
      >
        <span>${htmlEscape(def.name)} ${htmlEscape(preview.label)}</span>
      </div>
    `;
  }

  function getRangePreviewRect(unit, def) {
    if (def.healShape === "cross") {
      const range = def.healRange ?? def.range;
      return {
        left: unit.col - range,
        top: unit.row - range,
        width: range * 2 + 1,
        height: range * 2 + 1,
        shape: "cross",
        label: `十字${range}マス`
      };
    }

    if (def.shape === "around") {
      const radius = def.circleRadius || 1.5;
      const left = unit.col + 0.5 - radius;
      const top = unit.row + 0.5 - radius;
      return {
        left,
        top,
        width: radius * 2,
        height: radius * 2,
        shape: "circle",
        label: "周囲1マス"
      };
    }

    if (def.shape === "frontBox") {
      const rowReach = Math.floor((def.rangeRows || 3) / 2);
      const left = clamp(unit.col + 1, 0, COLS);
      const top = clamp(unit.row - rowReach, 0, ROWS);
      const right = clamp(unit.col + 1 + def.range, 0, COLS);
      const bottom = clamp(unit.row + rowReach + 1, 0, ROWS);
      return {
        left,
        top,
        width: Math.max(0.5, right - left),
        height: bottom - top,
        label: `前方${def.range}×${def.rangeRows || 3}マス`
      };
    }

    const left = clamp(unit.col, 0, COLS);
    const right = clamp(unit.col + def.range, 0, COLS);
    return {
      left,
      top: unit.row,
      width: Math.max(0.55, right - left),
      height: 1,
      label: def.pierce ? `貫通 射程${def.range}` : `射程${def.range}`
    };
  }

  function renderSkills() {
    if (!els.skillHint || !els.skillStrip) return;
    const units = getUnits();
    els.skillHint.textContent = units.length ? "準備OKで発動" : "配置後に使用可能";
    if (!units.length) {
      els.skillStrip.innerHTML = '<div class="empty-skill">仲間を配置してください</div>';
      return;
    }

    els.skillStrip.innerHTML = units
      .map((unit) => {
        const def = unitById[unit.type];
        const charge = clamp(unit.skill, 0, 100);
        const ready = charge >= 100;
        return `
          <button class="skill-button ${ready ? "is-ready" : ""}" type="button" data-skill="${unit.id}" ${ready ? "" : "disabled"} style="--unit-color:${def.color}">
            <span class="unit-token p-${def.portrait}" aria-hidden="true"></span>
            <span><b>${def.skill}</b><small>${def.name}</small></span>
            <span class="skill-charge"><i style="--charge:${charge}%"></i></span>
          </button>
        `;
      })
      .join("");

    els.skillStrip.querySelectorAll(".skill-button").forEach((button) => {
      button.addEventListener("click", () => {
        const unit = units.find((candidate) => candidate.id === button.dataset.skill);
        if (unit) activateSkill(unit);
      });
    });
  }

  function activateSkill(unit) {
    if (state.paused || state.gameOver || state.victory || unit.skill < 100) return;
    const def = unitById[unit.type];
    triggerAttackMotion(unit, def, 1.2);
    unit.skill = 0;
    log(`${def.name}の${def.skill}発動`);

    if (def.id === "pastel") {
      for (const ally of getUnits()) {
        if (!isInHealRange(unit, def, ally)) continue;
        ally.hp = clamp(ally.hp + 1500, 0, ally.maxHp);
        addEffect(ally.col + 0.5, ally.row + 0.5, "+1500", "#9dff9f");
      }
      return;
    }

    if (def.id === "lunaria") {
      for (const enemy of state.enemies) {
        applyDamage(enemy, 1450, def);
        enemy.slow = Math.max(enemy.slow, 1.2);
      }
      addEffect(unit.col + 0.5, unit.row + 0.5, "月光", def.color);
      return;
    }

    if (def.id === "leafa") {
      const targets = state.enemies.filter((enemy) => enemy.row === unit.row);
      for (const enemy of targets) {
        applyDamage(enemy, 110, def);
      }
      addEffect(unit.col + 1.7, unit.row + 0.5, "連射", def.color);
      return;
    }

    if (def.id === "yami") {
      for (const enemy of state.enemies) {
        if (distance(unit.col + 0.5, unit.row + 0.5, enemy.x, enemy.row + 0.5) <= 3.2) {
          applyDamage(enemy, 1250, def);
          enemy.slow = Math.max(enemy.slow, 2.4);
        }
      }
      addEffect(unit.col + 0.5, unit.row + 0.5, "影縛り", def.color);
      return;
    }

    for (const enemy of state.enemies) {
      if (enemy.row === unit.row && enemy.x <= unit.col + 3.0 && enemy.x >= unit.col - 0.2) {
        applyDamage(enemy, def.id === "riku" ? 1900 : 1650, def);
      }
    }
    addEffect(unit.col + 1.2, unit.row + 0.5, def.id === "riku" ? "烈火" : "乱打", def.color);
  }

  function resetGame(stageIndex = state.stageIndex) {
    hideResultPop(false);
    state.stageIndex = clamp(stageIndex, 0, stageDefs.length - 1);
    const stage = currentStage();
    state.selectedUnit = stage.allowedUnits[0];
    state.cost = stage.initialCost;
    state.maxCost = stage.maxCost;
    state.lives = stage.lives || 10;
    state.waveIndex = 0;
    state.running = false;
    state.paused = false;
    state.speed = 1;
    state.queue = [];
    state.spawnClock = 0;
    state.enemySerial = 0;
    state.waveActive = false;
    state.intermission = 0;
    state.gameOver = false;
    state.victory = false;
    state.campaignCleared = false;
    state.hoveredUnitId = null;
    state.units = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    state.enemies = [];
    state.projectiles = [];
    state.effects = [];
    state.deployCooldowns = {};
    state.logs = [];
    els.logPanel.innerHTML = "";
    renderRoster();
    log(stage.guide);
    log(`${stage.name} 部隊編成を開始`);
    updateHud();
    draw();
  }

  function enterGameScreen() {
    els.titleScreen.classList.add("is-hidden");
    els.gameShell.classList.remove("is-hidden");
    updateHud();
    draw();
  }

  function saveGameState() {
    try {
      const units = getUnits().map((unit) => ({
        type: unit.type,
        row: unit.row,
        col: unit.col,
        hp: Math.round(unit.hp),
        skill: Math.round(unit.skill)
      }));
      const payload = {
        stageIndex: state.stageIndex,
        selectedUnit: state.selectedUnit,
        cost: Math.floor(state.cost),
        maxCost: state.maxCost,
        lives: state.lives,
        waveIndex: state.waveIndex,
        deployCooldowns: Object.fromEntries(
          Object.entries(state.deployCooldowns).map(([unitId, cooldown]) => [unitId, Math.ceil(cooldown)])
        ),
        units,
        savedAt: Date.now()
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    } catch (error) {
      // Local storage can be unavailable in strict browser modes; gameplay should continue.
    }
  }

  function saveStageStart(stageIndex) {
    try {
      const stage = stageDefs[stageIndex];
      if (!stage) return;
      const payload = {
        stageIndex,
        selectedUnit: stage.allowedUnits[0],
        cost: stage.initialCost,
        maxCost: stage.maxCost,
        lives: stage.lives || 10,
        waveIndex: 0,
        deployCooldowns: {},
        units: [],
        savedAt: Date.now()
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    } catch (error) {
      // Ignore storage errors.
    }
  }

  function clearSavedGame() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (error) {
      // Ignore storage errors.
    }
  }

  function loadSavedGame() {
    let payload;
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      payload = JSON.parse(raw);
    } catch (error) {
      return false;
    }

    if (!payload || !Array.isArray(payload.units)) return false;

    state.stageIndex = clamp(Number(payload.stageIndex) || 0, 0, stageDefs.length - 1);
    const stage = currentStage();
    state.selectedUnit = unitById[payload.selectedUnit] && isUnitAvailable(payload.selectedUnit)
      ? payload.selectedUnit
      : stage.allowedUnits[0];
    state.cost = clamp(Number(payload.cost) || stage.initialCost, 0, Number(payload.maxCost) || stage.maxCost);
    state.maxCost = Math.max(stage.maxCost, Number(payload.maxCost) || stage.maxCost);
    state.lives = clamp(Number(payload.lives) || stage.lives || 10, 1, stage.lives || 10);
    state.waveIndex = clamp(Number(payload.waveIndex) || 0, 0, currentWaves().length - 1);
    state.running = false;
    state.paused = false;
    state.speed = 1;
    state.queue = [];
    state.spawnClock = 0;
    state.enemySerial = 0;
    state.waveActive = false;
    state.intermission = 0;
    state.gameOver = false;
    state.victory = false;
    state.campaignCleared = false;
    state.hoveredUnitId = null;
    state.units = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    state.enemies = [];
    state.projectiles = [];
    state.effects = [];
    state.deployCooldowns = {};
    state.logs = [];
    els.logPanel.innerHTML = "";

    const elapsed = Math.max(0, (Date.now() - (Number(payload.savedAt) || Date.now())) / 1000);
    if (payload.deployCooldowns && typeof payload.deployCooldowns === "object") {
      for (const [unitId, cooldown] of Object.entries(payload.deployCooldowns)) {
        if (!unitById[unitId]) continue;
        const remaining = Number(cooldown) - elapsed;
        if (remaining > 0) {
          state.deployCooldowns[unitId] = Math.min(getDeployCooldownDuration(unitId), remaining);
        }
      }
    }

    for (const savedUnit of payload.units) {
      const def = unitById[savedUnit.type];
      const row = Number(savedUnit.row);
      const col = Number(savedUnit.col);
      if (!def || !isUnitAvailable(def.id) || !Number.isInteger(row) || !Number.isInteger(col)) continue;
      if (row < 0 || row >= ROWS || col < 0 || col >= PLACEABLE_COLS) continue;
      if (state.units[row][col]) continue;
      const savedHp = Number(savedUnit.hp) || def.hp;
      const hp = savedHp > 0 && savedHp <= def.hp / 8 ? savedHp * 10 : savedHp;
      state.units[row][col] = {
        id: uid("unit"),
        type: def.id,
        row,
        col,
        hp: clamp(hp, 1, def.hp),
        maxHp: def.hp,
        cooldown: 0.25,
        skill: clamp(Number(savedUnit.skill) || 18, 0, 100)
      };
    }

    renderRoster();
    log(stage.guide);
    log(`${stage.name} 続きから再開`);
    updateHud();
    draw();
    return true;
  }

  function loop(now) {
    const dt = clamp((now - lastFrame) / 1000, 0, 0.05) * state.speed;
    lastFrame = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  els.startButton.addEventListener("click", startButtonAction);
  els.newGameButton.addEventListener("click", () => {
    clearSavedGame();
    resetGame(0);
    enterGameScreen();
    openStory("pre", 0);
  });
  els.continueButton.addEventListener("click", () => {
    const loaded = loadSavedGame();
    if (!loaded) {
      resetGame();
      showToast("セーブデータがないため、はじめから開始します。");
    }
    enterGameScreen();
    if (!loaded) {
      openStory("pre", state.stageIndex);
    }
  });
  els.pauseButton.addEventListener("click", () => {
    state.paused = !state.paused;
    updateHud();
  });
  els.resetButton.addEventListener("click", () => resetGame(state.stageIndex));
  els.speedButton.addEventListener("click", () => {
    state.speed = state.speed === 1 ? 2 : state.speed === 2 ? 3 : 1;
    updateHud();
  });
  els.storyPrevButton.addEventListener("click", () => moveStory(-1));
  els.storyNextButton.addEventListener("click", () => moveStory(1));
  els.storySkipButton.addEventListener("click", closeStory);
  els.resultPop.addEventListener("click", () => {
    if (els.resultPop.classList.contains("is-visible")) {
      hideResultPop();
    }
  });
  els.resultPop.addEventListener("keydown", (event) => {
    if (!els.resultPop.classList.contains("is-visible")) return;
    if (event.key === "Enter" || event.key === " " || event.key === "Escape") {
      event.preventDefault();
      hideResultPop();
    }
  });
  document.getElementById("board").addEventListener("pointermove", (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * COLS;
    const y = ((event.clientY - rect.top) / rect.height) * ROWS;
    const hovered = getUnits()
      .map((unit) => ({
        unit,
        dx: Math.abs(x - (unit.col + 0.5)),
        dy: Math.abs(y - (unit.row + 0.55))
      }))
      .filter((hit) => hit.dx <= 0.5 && hit.dy <= 0.58)
      .sort((a, b) => a.dx + a.dy - (b.dx + b.dy))[0];
    const nextId = hovered ? hovered.unit.id : null;
    if (state.hoveredUnitId !== nextId) {
      state.hoveredUnitId = nextId;
      draw();
    }
  });
  document.getElementById("board").addEventListener("pointerleave", () => {
    if (state.hoveredUnitId) {
      state.hoveredUnitId = null;
      draw();
    }
  });
  createGrid();
  renderRoster();
  resetGame();
  requestAnimationFrame(loop);
})();
