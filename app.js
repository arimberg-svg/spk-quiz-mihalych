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
  scoreTitle: document.getElementById("score-title"),
  verdict: document.getElementById("score-verdict"),
  topicStats: document.getElementById("topic-stats"),
  review: document.getElementById("review"),
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

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreOpen(q, text) {
  const n = normalize(text);
  if (!n || n.length < 12) return { ok: false, partial: false, hits: 0 };
  const hits = (q.keywords || []).filter((k) => n.includes(normalize(k))).length;
  const need = q.minKeywords || 3;
  if (hits >= need) return { ok: true, partial: false, hits };
  if (hits >= Math.max(2, Math.ceil(need * 0.5))) return { ok: false, partial: true, hits };
  return { ok: false, partial: false, hits };
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

function grade() {
  let correct = 0;
  let partial = 0;
  const byTopic = {};

  const rows = questions.map((q, i) => {
    if (!byTopic[q.topic]) byTopic[q.topic] = { ok: 0, total: 0, partial: 0 };
    byTopic[q.topic].total += 1;

    if (q.type === "open") {
      const s = scoreOpen(q, answers[i]);
      if (s.ok) {
        correct += 1;
        byTopic[q.topic].ok += 1;
      } else if (s.partial) {
        partial += 1;
        byTopic[q.topic].partial += 1;
      }
      return { q, i, s, open: true };
    }

    const ok = answers[i] === q.answer;
    if (ok) {
      correct += 1;
      byTopic[q.topic].ok += 1;
    }
    return { q, i, ok, open: false };
  });

  const name = el.name.value.trim();
  const total = questions.length;
  el.scoreNum.textContent = String(correct);
  if (el.scoreTotal) el.scoreTotal.textContent = String(total);
  el.scoreTitle.textContent = name ? `${name}, ваш результат` : "Ваш результат";

  let verdict;
  if (correct >= Math.ceil(total * 0.86)) {
    verdict = "Отлично — материал усвоен, можно вести смену уверенно.";
  } else if (correct >= Math.ceil(total * 0.69)) {
    verdict = "Хорошо — база есть, подтяните слабые темы по разбору ниже.";
  } else if (correct >= Math.ceil(total * 0.51)) {
    verdict = "Средне — перечитайте регламент СПК, бейджи, пустые крючки и общение.";
  } else {
    verdict = "Нужно повторно изучить регламенты перед самостоятельной сменой.";
  }
  if (partial > 0) {
    verdict += ` Частично засчитано открытых ответов: ${partial}.`;
  }
  el.verdict.textContent = verdict;

  el.topicStats.innerHTML = Object.entries(byTopic)
    .map(([topic, s]) => {
      const extra = s.partial ? ` · частичн. ${s.partial}` : "";
      return `<div class="topic-row"><span>${topic}</span><strong>${s.ok}/${s.total}${extra}</strong></div>`;
    })
    .join("");

  el.review.innerHTML = rows
    .map((row) => {
      if (row.open) {
        const cls = row.s.ok ? "ok" : row.s.partial ? "partial" : "bad";
        const mark = row.s.ok ? "Зачтено" : row.s.partial ? "Частично" : "Недостаточно";
        const yours = answers[row.i] ? answers[row.i] : "—";
        return `
          <div class="review-item ${cls}">
            <div class="mark">${mark} · вопрос ${row.i + 1} · открытый</div>
            <div>${row.q.q}</div>
            <div class="muted">Ваш ответ: ${escapeHtml(yours)}</div>
            <div class="sample"><strong>Эталон:</strong> ${escapeHtml(row.q.sample)}</div>
          </div>`;
      }

      const yours = answers[row.i] ? `${answers[row.i]})` : "—";
      return `
        <div class="review-item ${row.ok ? "ok" : "bad"}">
          <div class="mark">${row.ok ? "Верно" : "Ошибка"} · вопрос ${row.i + 1}</div>
          <div>${row.q.q}</div>
          <div class="muted">Ваш ответ: ${yours} · верно: ${row.q.answer})</div>
          <div class="sample">${escapeHtml(row.q.explain || "")}</div>
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
