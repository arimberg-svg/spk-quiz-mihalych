const LETTERS = ["a", "b", "c", "d"];

let questions = [];
let answers = [];
let current = 0;

const el = {
  start: document.getElementById("screen-start"),
  quiz: document.getElementById("screen-quiz"),
  result: document.getElementById("screen-result"),
  name: document.getElementById("user-name"),
  startBtn: document.getElementById("btn-start"),
  prev: document.getElementById("btn-prev"),
  next: document.getElementById("btn-next"),
  restart: document.getElementById("btn-restart"),
  counter: document.getElementById("q-counter"),
  topic: document.getElementById("q-topic"),
  type: document.getElementById("q-type"),
  text: document.getElementById("q-text"),
  options: document.getElementById("options"),
  openWrap: document.getElementById("open-wrap"),
  openAnswer: document.getElementById("open-answer"),
  bar: document.getElementById("progress-bar"),
  scoreNum: document.getElementById("score-num"),
  scoreTotal: document.getElementById("score-total"),
  scorePercent: document.getElementById("score-percent"),
  scoreTitle: document.getElementById("score-title"),
  verdict: document.getElementById("score-verdict"),
  summaryCards: document.getElementById("summary-cards"),
  topicStats: document.getElementById("topic-stats"),
  weakBlock: document.getElementById("weak-block"),
  weakList: document.getElementById("weak-list"),
  review: document.getElementById("review"),
};

const TOPIC_TIPS = {
  "Цикл дня": "Перечитайте формулировку цикла: остатки → люди → клиент → цифры.",
  Утро: "Пятиминутка: внешний вид, итоги вчера → цели сегодня, задания, информация из офиса.",
  Обход: "Маршрут обхода: улица → касса → зал → склад; фиксируйте замечания по зонам.",
  Контроль: "Минимум: пересчёт кассы ≥ 2 раза и контроль качества приёмки ≥ 2 раза в день.",
  Заказы: "Срок жизни незакрытого заказа — 14 дней; статусы актуализирует СПК.",
  Первичка: "УПД в день отгрузки и подписание в том же месяце; фото подотчёта бухгалтеру-кассиру за 3 дня.",
  Режим: "Сезон отпуска 15.04–15.08; перерыв 1 час не входит в рабочее время; курение только в отведённых местах.",
  Общение: "Стоп-эмоция → факты → решение через СПК; без мата и споров при клиентах.",
  Команда: "Коррекция наедине: факт → влияние → что изменить → срок.",
  Инкассация: "Заявку в «Сберинкассации» создаёт магазин сам; готовит сейф-пакет и эл. накладную.",
  Подчинение: "Супервайзер → руководитель розницы → генеральный директор.",
  Товар: "В 1С: отрицательные остатки, зависшие документы, пустые крючки, списания/оприходования, мин-максы.",
  Бейджи: "ФИО + должность + QR; печать из 1С:Торговля; стажёры — «Стажёр Магазин».",
  "Внешний вид": "Форма по сезону + читаемый бейдж.",
  "Пустые крючки": "Синхронизация зала и учёта; пн/чт; извиняшки; ТСД «Проверка крючков»; закрытие пересчёта с «ГОТОВО».",
  "Мин-макс": "Еженедельно держать товар на полке и корректировать мин-макс / НО через закуп.",
  "Неликвиды 180+": "Контролируйте остатки, выкладку, вид, комплектность, цены конкурентов и знание продавцов.",
  Вечер: "Переоценка, склад, инкассация/отчёт, первичка, итог факт vs план.",
  "Форс-мажор": "Клиент → очередь → замена; фиксируйте причину и эскалируйте.",
  "Постановка задач": "Что / срок / ответственный / критерий «готово».",
};

function show(screen) {
  el.start.classList.toggle("hidden", screen !== "start");
  el.quiz.classList.toggle("hidden", screen !== "quiz");
  el.result.classList.toggle("hidden", screen !== "result");
}

function letterOf(optionText) {
  const m = String(optionText).trim().match(/^([A-Da-d])\)/);
  return m ? m[1].toLowerCase() : null;
}

function optionByLetter(q, letter) {
  if (!q.options || !letter) return "";
  const found = q.options.find((opt) => letterOf(opt) === String(letter).toLowerCase());
  return found || `${letter})`;
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreOpen(q, text) {
  const n = normalize(text);
  const keys = q.keywords || [];
  const matched = [];
  const missed = [];
  keys.forEach((k) => {
    if (n.includes(normalize(k))) matched.push(k);
    else missed.push(k);
  });
  const hits = matched.length;
  const need = q.minKeywords || 3;
  if (!n || n.length < 12) {
    return { ok: false, partial: false, hits: 0, need, matched, missed: keys.slice() };
  }
  if (hits >= need) return { ok: true, partial: false, hits, need, matched, missed };
  if (hits >= Math.max(2, Math.ceil(need * 0.5))) {
    return { ok: false, partial: true, hits, need, matched, missed };
  }
  return { ok: false, partial: false, hits, need, matched, missed };
}

function hasAnswer() {
  const q = questions[current];
  if (!q) return false;
  if (q.type === "open") {
    return normalize(answers[current]).length >= 12;
  }
  return Boolean(answers[current]);
}

function syncNextState() {
  el.prev.disabled = current === 0;
  el.next.disabled = !hasAnswer();
  el.next.textContent = current === questions.length - 1 ? "Завершить" : "Далее";
}

function renderQuestion() {
  const q = questions[current];
  el.counter.textContent = `${current + 1} / ${questions.length}`;
  el.topic.textContent = q.topic;
  el.text.textContent = q.q;
  el.bar.style.width = `${((current + 1) / questions.length) * 100}%`;

  const isOpen = q.type === "open";
  el.type.textContent = isOpen ? "Открытый" : "Варианты";
  el.type.className = `badge-type ${isOpen ? "open" : "mc"}`;

  el.options.classList.toggle("hidden", isOpen);
  el.openWrap.classList.toggle("hidden", !isOpen);

  if (isOpen) {
    el.options.innerHTML = "";
    el.openAnswer.value = answers[current] || "";
    el.openAnswer.oninput = () => {
      answers[current] = el.openAnswer.value;
      syncNextState();
    };
  } else {
    el.options.innerHTML = "";
    q.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option";
      btn.textContent = opt;
      const key = letterOf(opt) || LETTERS[idx];
      if (answers[current] === key) btn.classList.add("selected");
      btn.addEventListener("click", () => {
        answers[current] = key;
        [...el.options.children].forEach((c) => c.classList.remove("selected"));
        btn.classList.add("selected");
        syncNextState();
      });
      el.options.appendChild(btn);
    });
  }

  syncNextState();
}

function sortRows(rows) {
  const rank = (row) => {
    if (row.open) {
      if (row.s.ok) return 2;
      if (row.s.partial) return 1;
      return 0;
    }
    return row.ok ? 2 : 0;
  };
  return [...rows].sort((a, b) => rank(a) - rank(b) || a.i - b.i);
}

function renderKeywordChips(s) {
  const hits = (s.matched || [])
    .map((k) => `<span class="kw hit">+ ${escapeHtml(k)}</span>`)
    .join("");
  const miss = (s.missed || [])
    .slice(0, 8)
    .map((k) => `<span class="kw miss">− ${escapeHtml(k)}</span>`)
    .join("");
  return `<div class="kw-row">${hits}${miss}</div>
    <div class="muted">Ключевые слова: ${s.hits}/${s.need} минимум для зачёта (всего маркеров в эталоне: ${(s.matched || []).length + (s.missed || []).length})</div>`;
}

function grade() {
  let correct = 0;
  let partial = 0;
  let mcTotal = 0;
  let mcOk = 0;
  let openTotal = 0;
  let openOk = 0;
  const byTopic = {};

  const rows = questions.map((q, i) => {
    if (!byTopic[q.topic]) byTopic[q.topic] = { ok: 0, total: 0, partial: 0, wrong: [] };
    byTopic[q.topic].total += 1;

    if (q.type === "open") {
      openTotal += 1;
      const s = scoreOpen(q, answers[i]);
      if (s.ok) {
        correct += 1;
        openOk += 1;
        byTopic[q.topic].ok += 1;
      } else if (s.partial) {
        partial += 1;
        byTopic[q.topic].partial += 1;
        byTopic[q.topic].wrong.push(i + 1);
      } else {
        byTopic[q.topic].wrong.push(i + 1);
      }
      return { q, i, s, open: true };
    }

    mcTotal += 1;
    const ok = answers[i] === q.answer;
    if (ok) {
      correct += 1;
      mcOk += 1;
      byTopic[q.topic].ok += 1;
    } else {
      byTopic[q.topic].wrong.push(i + 1);
    }
    return { q, i, ok, open: false };
  });

  const name = el.name.value.trim();
  const total = questions.length;
  const pct = total ? Math.round((correct / total) * 100) : 0;
  el.scoreNum.textContent = String(correct);
  if (el.scoreTotal) el.scoreTotal.textContent = String(total);
  if (el.scorePercent) el.scorePercent.textContent = `${pct}% верных · ошибок: ${total - correct - partial}${partial ? ` · частично: ${partial}` : ""}`;
  el.scoreTitle.textContent = name ? `${name}, ваш результат` : "Ваш результат";

  let verdict;
  if (correct >= Math.ceil(total * 0.86)) {
    verdict = "Отлично — материал усвоен, можно вести смену уверенно.";
  } else if (correct >= Math.ceil(total * 0.69)) {
    verdict = "Хорошо — база есть, разберите ошибки ниже по темам.";
  } else if (correct >= Math.ceil(total * 0.51)) {
    verdict = "Средне — повторите слабые блоки (бейджи, крючки, общение, первичка).";
  } else {
    verdict = "Нужно повторно изучить регламенты перед самостоятельной сменой.";
  }
  el.verdict.textContent = verdict;

  if (el.summaryCards) {
    el.summaryCards.innerHTML = `
      <div class="summary-card ok"><span class="label">Верно</span><span class="value">${correct}</span></div>
      <div class="summary-card bad"><span class="label">Ошибки</span><span class="value">${total - correct - partial}</span></div>
      <div class="summary-card partial"><span class="label">Частично (открытые)</span><span class="value">${partial}</span></div>
      <div class="summary-card"><span class="label">С вариантами</span><span class="value">${mcOk}/${mcTotal}</span></div>
      <div class="summary-card"><span class="label">Открытые</span><span class="value">${openOk}/${openTotal}</span></div>
      <div class="summary-card"><span class="label">Тем с ошибками</span><span class="value">${Object.values(byTopic).filter((s) => s.ok < s.total).length}</span></div>
    `;
  }

  el.topicStats.innerHTML = Object.entries(byTopic)
    .sort((a, b) => a[1].ok / a[1].total - b[1].ok / b[1].total || a[0].localeCompare(b[0], "ru"))
    .map(([topic, s]) => {
      const pctTopic = Math.round((s.ok / s.total) * 100);
      const extra = s.partial ? ` · частичн. ${s.partial}` : "";
      const wrong = s.wrong.length ? ` · № ${s.wrong.join(", ")}` : "";
      return `<div class="topic-row"><span>${topic}<br><span class="muted" style="font-size:0.8rem">${pctTopic}%${wrong}</span></span><strong>${s.ok}/${s.total}${extra}</strong></div>`;
    })
    .join("");

  const weak = Object.entries(byTopic)
    .filter(([, s]) => s.ok < s.total)
    .sort((a, b) => a[1].ok / a[1].total - b[1].ok / b[1].total)
    .slice(0, 6);

  if (el.weakBlock && el.weakList) {
    if (!weak.length) {
      el.weakBlock.classList.add("hidden");
      el.weakList.innerHTML = "";
    } else {
      el.weakBlock.classList.remove("hidden");
      el.weakList.innerHTML = weak
        .map(([topic, s]) => {
          const tip = TOPIC_TIPS[topic] || "Перечитайте соответствующий раздел базы знаний / регламента.";
          return `<li><strong>${topic}</strong> (${s.ok}/${s.total}): ${escapeHtml(tip)}</li>`;
        })
        .join("");
    }
  }

  el.review.innerHTML = sortRows(rows)
    .map((row) => {
      if (row.open) {
        const cls = row.s.ok ? "ok" : row.s.partial ? "partial" : "bad";
        const mark = row.s.ok ? "Зачтено" : row.s.partial ? "Частично" : "Недостаточно";
        const yours = answers[row.i] ? answers[row.i] : "—";
        const gapNote = row.s.ok
          ? "Ответ покрывает обязательные маркеры регламента."
          : "Добавьте недостающие элементы из эталона — без них ответ неполный.";
        return `
          <div class="review-item ${cls}">
            <div class="mark">${mark} · вопрос ${row.i + 1}<span class="q-topic">${escapeHtml(row.q.topic)}</span></div>
            <div>${escapeHtml(row.q.q)}</div>
            <div class="opt-line"><strong>Ваш ответ:</strong> ${escapeHtml(yours)}</div>
            ${renderKeywordChips(row.s)}
            <div class="sample"><strong>Эталон:</strong> ${escapeHtml(row.q.sample)}<br><span class="muted">${gapNote}</span></div>
          </div>`;
      }

      const yoursLetter = answers[row.i];
      const yoursText = yoursLetter ? optionByLetter(row.q, yoursLetter) : "—";
      const rightText = optionByLetter(row.q, row.q.answer);
      const analysis = row.ok
        ? `Верно: выбран вариант ${row.q.answer.toUpperCase()}.`
        : `Ошибка: выбран ${yoursLetter ? yoursLetter.toUpperCase() : "—"}, верный — ${row.q.answer.toUpperCase()}.`;
      return `
        <div class="review-item ${row.ok ? "ok" : "bad"}">
          <div class="mark">${row.ok ? "Верно" : "Ошибка"} · вопрос ${row.i + 1}<span class="q-topic">${escapeHtml(row.q.topic)}</span></div>
          <div>${escapeHtml(row.q.q)}</div>
          <div class="opt-line"><strong>Ваш ответ:</strong> ${escapeHtml(yoursText)}</div>
          <div class="opt-line"><strong>Верный ответ:</strong> ${escapeHtml(rightText)}</div>
          <div class="sample"><strong>Пояснение:</strong> ${escapeHtml(row.q.explain || "")}<br><span class="muted">${analysis}</span></div>
        </div>`;
    })
    .join("");

  show("result");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

el.startBtn.addEventListener("click", () => {
  answers = Array(questions.length).fill(null);
  current = 0;
  show("quiz");
  renderQuestion();
});

el.prev.addEventListener("click", () => {
  if (current > 0) {
    current -= 1;
    renderQuestion();
  }
});

el.next.addEventListener("click", () => {
  if (!hasAnswer()) return;
  if (current === questions.length - 1) grade();
  else {
    current += 1;
    renderQuestion();
  }
});

el.restart.addEventListener("click", () => {
  answers = Array(questions.length).fill(null);
  current = 0;
  show("start");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

fetch("questions.json")
  .then((r) => r.json())
  .then((data) => {
    questions = data;
  })
  .catch(() => {
    el.verdict.textContent = "Не удалось загрузить вопросы.";
  });
