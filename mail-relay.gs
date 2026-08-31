/**
 * Резервный канал почты (Google Apps Script).
 * 1) Откройте https://script.google.com → Новый проект
 * 2) Вставьте этот код, сохраните
 * 3) Развернуть → Новое развёртывание → Веб-приложение
 *    - Выполнять от имени: Меня
 *    - Доступ: Все
 * 4) Скопируйте URL веб-приложения в app.js → MAIL_APPS_SCRIPT_URL
 */
function doPost(e) {
  try {
    var data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }
    var to = data.to || "arimberg@gmail.com";
    var subject = data.subject || "Тест СПК";
    var body = data.message || JSON.stringify(data, null, 2);
    MailApp.sendEmail({
      to: to,
      subject: subject,
      body: body,
    });
    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, service: "spk-quiz-mail-relay" })
  ).setMimeType(ContentService.MimeType.JSON);
}
