const LETTERS = ["a", "b", "c", "d"];
const MAIL_ENDPOINT = "https://formsubmit.co/ajax/arimberg@gmail.com";

let questions = [];
let answers = [];
let current = 0;
let profile = { name: "", store: "", role: "" };

const el = {
  start: document.getElementById("screen-start"),
  quiz: document.getElementById("screen-quiz"),
  result: document.getElementById("screen-result"),
  form: document.getElementById("start-form"),
  formError: document.getElementById("form-error"),
  name: document.getElementById("user-name"),
  store: document.getElementById("user-store"),
  role: document.getElementById("user-role"),
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
  mailStatus: document.getElementById("mail-status"),
  summaryCards: document.getElementById("summary-cards"),
  topicStats: document.getElementById("topic-stats"),
  weakBlock: document.getElementById("weak-block"),
  weakList: document.getElementById("weak-list"),
  review: document.getElementById("review"),
};

const TOPIC_TIPS = {
  "Цикл дня": "Цикл СПК: остатки → люди → клиент → цифры.",
  Утро: "Пятиминутка: внешний вид, итоги вчера → цели сегодня, задания.",
  Обход: "Маршрут: улица → касса → зал → склад.",
  Контроль: "Пересчёт кассы ≥ 2 раза; качество приёмки ≥ 2 раза.",
  Заказы: "Срок жизни заказа — 14 дней.",
  Первичка: "УПД в день отгрузки; фото подотчёта бухгалтеру-кассиру за 3 дня.",
  Режим: "Сезон 15.04–15.08; перерыв 1 час не входит в рабочее время.",
  Общение: "Стоп-эмоция → факты → решение через СПК.",
  Команда: "Коррекция наедине: факт → влияние → изменение → срок.",
  Инкассация: "Заявку создаёт магазин; лимит наличных для запроса — 50 000 ₽.",
  Подчинение: "Сразу руководитель розницы → генеральный директор.",
  Товар: "Отрицательные остатки, зависшие документы, крючки, мин-максы.",
  Бейджи: "ФИО + должность + QR; стажёры — «Стажёр Магазин».",
  "Внешний вид": "Форма по сезону + читаемый бейдж.",
  "Пустые крючки": "Синхронизация зала и учёта; пн/чт; извиняшки; ТСД.",
  "Мин-макс": "Товар на полке; корректировка НО через закуп.",
  "Неликвиды 180+": "Остатки, выкладка, вид, комплектность, цены, знание продавцов.",
  Вечер: "Переоценка, склад, инкассация/отчёт, первичка, итог дня.",
  "Форс-мажор": "Клиент → очередь → замена.",
  "Постановка задач": "Что / срок / ответственный / критерий «готово».",
  "СПК / остатки": "Минус: приёмка, резервы в заказах клиента, пересорт, группа в пересчёт.",
  "СПК / команда": "СПК — непосредственный руководитель кассира.",
  "СПК / инкассация": "Запрос на инкассацию при лимите 50 000 ₽.",
  "СПК / контроль смены": "Контроль кассы, склада и зала с обратной связью.",
  Кассир: "Средний чек, прикассовая зона, закрытие смены, сертификаты.",
  Кладовщик: "Чек-лист конца дня: 1С, брак, ТСД, порядок, подготовка к утру.",
  Продавец: "Выявление потребностей, наличие по системе, выкладка и акции.",
  Сертификаты: "Отдельный чек при продаже; оплата покупок — сумма ≥ номинала.",
  Лояльность: "Регистрация — QR в МАХ или на сайте; списание — динамический QR из Telegram, МАХ, ЛК или приложения; бонусы 180 дней; до 99%.",
  Резерв: "«По мере поступления» / «На складе» — иначе товар уйдёт другим подразделениям.",
  "Отгрузка 1С": "Сборка → оплата → выдача один раз → реализация + счёт-фактура.",
  "Реализация / УПД": "Отгрузка ЮЛ: паспорт, доверенность, печать; доверенность в реализации; СФ; подписи УПД.",
  "Договор 1С": "Галочки «Клиент» + «Создать договор»; автодоговор всем контрагентам.",
  "Монитор ИМ": "Кнопка на рабочем столе; свой магазин; порядок кнопок; выдача 1 раз.",
  "Перемещение ТМЦ": "Через РЦ; маркировка каждого места (заказ, ТТ, кол-во мест).",
  "Размен ЦО": "Запрос из 1С:Касса; приёмка/вскрытие под камерами; внесение ДС.",
  "Активный закуп": "Стол заказов → согласование закупа; поставка после статуса «Поставка товара».",
  "Корзина распродаж": "У кассы; список из min-max «Розница»; не брак; жёлтые ценники; кассир предлагает.",
  "Акционный стеллаж": "Все ценники жёлтые; плотная выкладка; нет позиции — аналоги; ≥½ в глубину.",
  Брак: "Предпродажный → склад брака; послепродажный при клиенте без автоперемещения; до 2000 ₽ — на месте; брак на магазине до решения специалиста.",
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
  if (q.type === "open") return normalize(answers[current]).length >= 12;
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
  el.type.className = `q-type ${isOpen ? "open" : "mc"}`;

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
    <div class="muted">Ключевые слова: ${s.hits}/${s.need} минимум для зачёта</div>`;
}

function buildMailPayload(rows, correct, partial, total, pct, byTopic) {
  const wrongLines = rows
    .filter((r) => (r.open ? !r.s.ok : !r.ok))
    .map((r) => {
      if (r.open) {
        const status = r.s.partial ? "частично" : "не зачтено";
        return `#${r.i + 1} [${r.q.topic}] ${status}\nQ: ${r.q.q}\nA: ${answers[r.i] || "—"}\n`;
      }
      return `#${r.i + 1} [${r.q.topic}] ошибка\nQ: ${r.q.q}\nВыбрано: ${optionByLetter(r.q, answers[r.i]) || "—"}\nВерно: ${optionByLetter(r.q, r.q.answer)}\n`;
    })
    .join("\n");

  const topicLines = Object.entries(byTopic)
    .map(([t, s]) => `${t}: ${s.ok}/${s.total}${s.partial ? ` (частичн. ${s.partial})` : ""}`)
    .join("\n");

  const allAnswers = rows
    .map((r) => {
      if (r.open) {
        const status = r.s.ok ? "OK" : r.s.partial ? "частично" : "нет";
        return `#${r.i + 1} [${r.q.topic}] ${status}\n${r.q.q}\n→ ${answers[r.i] || "—"}`;
      }
      const status = r.ok ? "OK" : "ошибка";
      return `#${r.i + 1} [${r.q.topic}] ${status}\n${r.q.q}\n→ ${optionByLetter(r.q, answers[r.i]) || "—"}`;
    })
    .join("\n\n");

  const clip = (text, max = 9000) =>
    text.length <= max ? text : `${text.slice(0, max)}\n…(обрезано)`;

  return {
    _subject: `Тест СПК: ${profile.name} · ${profile.store} · ${profile.role} · ${correct}/${total}`,
    _template: "table",
    _captcha: "false",
    _honey: "",
    name: profile.name,
    email: "arimberg@gmail.com",
    store: profile.store,
    position: profile.role,
    score: `${correct}/${total}`,
    percent: `${pct}%`,
    partial: String(partial),
    topics: clip(topicLines, 3000),
    mistakes: clip(wrongLines || "Ошибок нет", 6000),
    answers: clip(allAnswers, 9000),
    message: `Результат теста СПК\nФИО: ${profile.name}\nМагазин: ${profile.store}\nДолжность: ${profile.role}\nБалл: ${correct}/${total} (${pct}%)\nЧастично: ${partial}`,
  };
}

function payloadToFormData(payload) {
  const fd = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    fd.append(key, value == null ? "" : String(value));
  });
  return fd;
}

function sendViaHiddenForm(payload) {
  return new Promise((resolve) => {
    const frameName = `mail_frame_${Date.now()}`;
    const iframe = document.createElement("iframe");
    iframe.name = frameName;
    iframe.title = "mail";
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://formsubmit.co/arimberg@gmail.com";
    form.target = frameName;
    form.style.display = "none";

    Object.entries(payload).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value == null ? "" : String(value);
      form.appendChild(input);
    });

    const next = document.createElement("input");
    next.type = "hidden";
    next.name = "_next";
    next.value = "https://formsubmit.co/thanks.html";
    form.appendChild(next);

    document.body.appendChild(form);
    form.submit();

    window.setTimeout(() => {
      form.remove();
      iframe.remove();
      resolve(true);
    }, 2500);
  });
}

function sendViaBeacon(payload) {
  try {
    const fd = payloadToFormData(payload);
    if (navigator.sendBeacon) {
      return navigator.sendBeacon(MAIL_ENDPOINT, fd);
    }
  } catch (err) {
    console.warn("Beacon mail:", err);
  }
  return false;
}

function buildMailText(payload) {
  return [
    payload._subject,
    "",
    payload.message,
    "",
    "Темы:",
    payload.topics,
    "",
    "Ошибки:",
    payload.mistakes,
    "",
    "Все ответы:",
    payload.answers,
  ].join("\n");
}

function downloadMailBackup(payload) {
  const text = buildMailText(payload);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  a.href = url;
  a.download = `spk-test-${stamp}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

async function copyMailBackup(payload) {
  const text = buildMailText(payload);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}

async function sendResultEmail(payload) {
  if (!el.mailStatus) return;
  el.mailStatus.className = "mail-status";
  el.mailStatus.textContent = "Отправляем результат на arimberg@gmail.com (два канала)…";

  try {
    localStorage.setItem(
      "spkQuizLastResult",
      JSON.stringify({ at: new Date().toISOString(), payload })
    );
  } catch (_) {
    /* ignore */
  }

  let ajaxOk = false;
  let formOk = false;
  let beaconOk = false;
  let activationNeeded = false;

  // Channel 1: FormSubmit AJAX
  try {
    const res = await fetch(MAIL_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: payloadToFormData(payload),
    });
    const data = await res.json().catch(() => ({}));
    const success = data.success === true || data.success === "true";
    if (success) {
      ajaxOk = true;
    } else {
      const msg = String(data.message || "");
      if (/confirm|activation|activate|подтверд/i.test(msg)) {
        activationNeeded = true;
      }
      console.warn("FormSubmit AJAX:", msg || res.status);
    }
  } catch (err) {
    console.warn("FormSubmit AJAX:", err);
  }

  // Channel 2: hidden form POST (parallel backup)
  try {
    await sendViaHiddenForm(payload);
    formOk = true;
  } catch (err) {
    console.warn("FormSubmit form:", err);
  }

  // Channel 3: sendBeacon
  beaconOk = sendViaBeacon(payload);

  const delivered = ajaxOk || formOk || beaconOk;

  if (delivered && !activationNeeded) {
    el.mailStatus.className = "mail-status ok";
    el.mailStatus.innerHTML =
      "Результат отправлен на arimberg@gmail.com. " +
      '<button type="button" class="linkish" id="btn-copy-mail">Скопировать</button> · ' +
      '<button type="button" class="linkish" id="btn-dl-mail">Скачать txt</button>';
  } else if (activationNeeded) {
    el.mailStatus.className = "mail-status bad";
    el.mailStatus.innerHTML =
      "FormSubmit ждёт подтверждения на arimberg@gmail.com. " +
      "После подтверждения письма начнут приходить. " +
      '<button type="button" class="linkish" id="btn-copy-mail">Скопировать результат</button> · ' +
      '<button type="button" class="linkish" id="btn-dl-mail">Скачать txt</button>';
  } else {
    el.mailStatus.className = "mail-status bad";
    el.mailStatus.innerHTML =
      "Автоотправка не подтверждена. Сохраните результат и перешлите на arimberg@gmail.com. " +
      '<button type="button" class="linkish" id="btn-copy-mail">Скопировать</button> · ' +
      '<button type="button" class="linkish" id="btn-dl-mail">Скачать txt</button> · ' +
      '<a href="mailto:arimberg@gmail.com?subject=' +
      encodeURIComponent(payload._subject) +
      "&body=" +
      encodeURIComponent(payload.message + "\n\n" + (payload.mistakes || "").slice(0, 1200)) +
      '">Открыть письмо</a>';
  }

  const copyBtn = document.getElementById("btn-copy-mail");
  const dlBtn = document.getElementById("btn-dl-mail");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const ok = await copyMailBackup(payload);
      copyBtn.textContent = ok ? "Скопировано" : "Не удалось";
    });
  }
  if (dlBtn) {
    dlBtn.addEventListener("click", () => downloadMailBackup(payload));
  }
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

  const total = questions.length;
  const pct = total ? Math.round((correct / total) * 100) : 0;
  el.scoreNum.textContent = String(correct);
  if (el.scoreTotal) el.scoreTotal.textContent = String(total);
  if (el.scorePercent) {
    el.scorePercent.textContent = `${pct}% верных · ошибок: ${total - correct - partial}${
      partial ? ` · частично: ${partial}` : ""
    }`;
  }
  el.scoreTitle.textContent = `${profile.name}, ваш результат`;

  let verdict;
  if (correct >= Math.ceil(total * 0.86)) {
    verdict = "Отлично — материал усвоен, можно вести смену уверенно.";
  } else if (correct >= Math.ceil(total * 0.69)) {
    verdict = "Хорошо — база есть, разберите ошибки ниже по темам.";
  } else if (correct >= Math.ceil(total * 0.51)) {
    verdict = "Средне — повторите слабые блоки (СПК, роли смены, крючки, общение).";
  } else {
    verdict = "Нужно повторно изучить регламенты перед самостоятельной сменой.";
  }
  el.verdict.textContent = verdict;

  if (el.summaryCards) {
    el.summaryCards.innerHTML = `
      <div class="summary-card ok"><span class="label">Верно</span><span class="value">${correct}</span></div>
      <div class="summary-card bad"><span class="label">Ошибки</span><span class="value">${total - correct - partial}</span></div>
      <div class="summary-card partial"><span class="label">Частично</span><span class="value">${partial}</span></div>
      <div class="summary-card"><span class="label">С вариантами</span><span class="value">${mcOk}/${mcTotal}</span></div>
      <div class="summary-card"><span class="label">Открытые</span><span class="value">${openOk}/${openTotal}</span></div>
      <div class="summary-card"><span class="label">${escapeHtml(profile.role)} · ${escapeHtml(profile.store)}</span><span class="value">${pct}%</span></div>
    `;
  }

  el.topicStats.innerHTML = Object.entries(byTopic)
    .sort((a, b) => a[1].ok / a[1].total - b[1].ok / b[1].total || a[0].localeCompare(b[0], "ru"))
    .map(([topic, s]) => {
      const pctTopic = Math.round((s.ok / s.total) * 100);
      const extra = s.partial ? ` · частичн. ${s.partial}` : "";
      const wrong = s.wrong.length ? ` · № ${s.wrong.join(", ")}` : "";
      return `<div class="topic-row"><span>${escapeHtml(topic)}<br><span class="muted" style="font-size:0.8rem">${pctTopic}%${wrong}</span></span><strong>${s.ok}/${s.total}${extra}</strong></div>`;
    })
    .join("");

  const weak = Object.entries(byTopic)
    .filter(([, s]) => s.ok < s.total)
    .sort((a, b) => a[1].ok / a[1].total - b[1].ok / b[1].total)
    .slice(0, 8);

  if (el.weakBlock && el.weakList) {
    if (!weak.length) {
      el.weakBlock.classList.add("hidden");
      el.weakList.innerHTML = "";
    } else {
      el.weakBlock.classList.remove("hidden");
      el.weakList.innerHTML = weak
        .map(([topic, s]) => {
          const tip = TOPIC_TIPS[topic] || "Перечитайте раздел базы знаний / регламента.";
          return `<li><strong>${escapeHtml(topic)}</strong> (${s.ok}/${s.total}): ${escapeHtml(tip)}</li>`;
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
        return `
          <div class="review-item ${cls}">
            <div class="mark">${mark} · вопрос ${row.i + 1}<span class="q-topic">${escapeHtml(row.q.topic)}</span></div>
            <div>${escapeHtml(row.q.q)}</div>
            <div class="opt-line"><strong>Ваш ответ:</strong> ${escapeHtml(yours)}</div>
            ${renderKeywordChips(row.s)}
            <div class="sample"><strong>Эталон:</strong> ${escapeHtml(row.q.sample)}</div>
          </div>`;
      }

      const yoursLetter = answers[row.i];
      const yoursText = yoursLetter ? optionByLetter(row.q, yoursLetter) : "—";
      const rightText = optionByLetter(row.q, row.q.answer);
      return `
        <div class="review-item ${row.ok ? "ok" : "bad"}">
          <div class="mark">${row.ok ? "Верно" : "Ошибка"} · вопрос ${row.i + 1}<span class="q-topic">${escapeHtml(row.q.topic)}</span></div>
          <div>${escapeHtml(row.q.q)}</div>
          <div class="opt-line"><strong>Ваш ответ:</strong> ${escapeHtml(yoursText)}</div>
          <div class="opt-line"><strong>Верный ответ:</strong> ${escapeHtml(rightText)}</div>
          <div class="sample"><strong>Пояснение:</strong> ${escapeHtml(row.q.explain || "")}</div>
        </div>`;
    })
    .join("");

  show("result");
  window.scrollTo({ top: 0, behavior: "smooth" });
  sendResultEmail(buildMailPayload(rows, correct, partial, total, pct, byTopic));
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function readProfile() {
  return {
    name: el.name.value.trim(),
    store: el.store.value.trim(),
    role: el.role.value.trim(),
  };
}

function profileValid(p) {
  return Boolean(p.name && p.store && p.role);
}

el.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const p = readProfile();
  if (!profileValid(p)) {
    el.formError.classList.remove("hidden");
    return;
  }
  el.formError.classList.add("hidden");
  if (!questions.length) {
    el.formError.textContent = "Вопросы ещё загружаются — подождите секунду.";
    el.formError.classList.remove("hidden");
    return;
  }
  profile = p;
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
    if (el.formError) {
      el.formError.textContent = "Не удалось загрузить вопросы.";
      el.formError.classList.remove("hidden");
    }
  });
