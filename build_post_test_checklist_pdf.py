# -*- coding: utf-8 -*-
"""Чек-лист после тестирования СПК — печатный PDF (A4)."""

from pathlib import Path

from reportlab.lib.colors import Color, HexColor, white, black
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUT = Path(__file__).with_name("Чек-лист_после_тестирования_СПК.pdf")

# Шрифты Windows с кириллицей
FONT_REG = "DejaVuSans"
FONT_BOLD = "DejaVuSans-Bold"
candidates = [
    (r"C:\Windows\Fonts\arial.ttf", r"C:\Windows\Fonts\arialbd.ttf"),
    (r"C:\Windows\Fonts\calibri.ttf", r"C:\Windows\Fonts\calibrib.ttf"),
    (r"C:\Windows\Fonts\tahoma.ttf", r"C:\Windows\Fonts\tahomabd.ttf"),
]
for reg, bold in candidates:
    if Path(reg).exists() and Path(bold).exists():
        pdfmetrics.registerFont(TTFont(FONT_REG, reg))
        pdfmetrics.registerFont(TTFont(FONT_BOLD, bold))
        break
else:
    raise SystemExit("Не найден системный шрифт с кириллицей (Arial/Calibri/Tahoma).")

PURPLE = HexColor("#4208a8")
PURPLE_SOFT = HexColor("#efe9ff")
LINE = HexColor("#cfc4e8")
MUTED = HexColor("#5c5278")
TEXT = HexColor("#1a1033")
BOX = HexColor("#f7f4ff")


def P(text, style):
    return Paragraph(text.replace("\n", "<br/>"), style)


def section_title(text, styles):
    return KeepTogether(
        [
            Spacer(1, 2 * mm),
            P(text, styles["secTitle"]),
            HRFlowable(width="100%", thickness=1, color=PURPLE, spaceBefore=1, spaceAfter=3),
        ]
    )


def checkbox_row(label, styles, lines=1):
    """Строка: ☐ вопрос + линия(и) для ответа."""
    box = P("☐&nbsp;&nbsp;" + label, styles["body"])
    if lines <= 0:
        return [box, Spacer(1, 1.5 * mm)]
    flow = [box]
    for _ in range(lines):
        flow.append(
            HRFlowable(
                width="100%",
                thickness=0.6,
                color=LINE,
                spaceBefore=3.2 * mm,
                spaceAfter=0.8 * mm,
            )
        )
    flow.append(Spacer(1, 1.2 * mm))
    return flow


def add_items(story, styles, items):
    for label, lines in items:
        story.extend(checkbox_row(label, styles, lines))


def build():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="brand",
            fontName=FONT_BOLD,
            fontSize=9,
            textColor=PURPLE,
            alignment=TA_CENTER,
            spaceAfter=1 * mm,
            leading=12,
        )
    )
    styles.add(
        ParagraphStyle(
            name="docTitle",
            fontName=FONT_BOLD,
            fontSize=14,
            textColor=TEXT,
            alignment=TA_CENTER,
            spaceAfter=2 * mm,
            leading=18,
        )
    )
    styles.add(
        ParagraphStyle(
            name="sub",
            fontName=FONT_REG,
            fontSize=8.5,
            textColor=MUTED,
            alignment=TA_CENTER,
            spaceAfter=3 * mm,
            leading=11,
        )
    )
    styles.add(
        ParagraphStyle(
            name="secTitle",
            fontName=FONT_BOLD,
            fontSize=10,
            textColor=PURPLE,
            alignment=TA_LEFT,
            spaceBefore=1 * mm,
            spaceAfter=0,
            leading=13,
        )
    )
    styles.add(
        ParagraphStyle(
            name="body",
            fontName=FONT_REG,
            fontSize=9,
            textColor=TEXT,
            alignment=TA_LEFT,
            leading=12,
        )
    )
    styles.add(
        ParagraphStyle(
            name="small",
            fontName=FONT_REG,
            fontSize=8,
            textColor=MUTED,
            alignment=TA_LEFT,
            leading=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="label",
            fontName=FONT_BOLD,
            fontSize=8.5,
            textColor=TEXT,
            leading=11,
        )
    )

    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=12 * mm,
        rightMargin=12 * mm,
        topMargin=10 * mm,
        bottomMargin=10 * mm,
        title="Чек-лист после тестирования СПК",
        author="У Михалыча",
    )

    story = []
    story.append(P("СЕТЬ «У МИХАЛЫЧА» · РОЗНИЦА", styles["brand"]))
    story.append(P("Чек-лист после тестирования СПК", styles["docTitle"]))
    story.append(
        P(
            "Заполняется на встрече по итогам прохождения теста. Один лист — один сотрудник. "
            "Листы собираются для анализа.",
            styles["sub"],
        )
    )

    # Шапка: данные + галочки-напоминания
    fields = Table(
        [
            [P("<b>ФИО</b>", styles["label"]), P("_______________________________________________________________", styles["body"])],
            [P("<b>Магазин</b>", styles["label"]), P("_______________________________________________________________", styles["body"])],
            [P("<b>Должность</b>", styles["label"]), P("_______________________________________________________________", styles["body"])],
            [P("<b>Дата встречи</b>", styles["label"]), P("«____» _____________ 202__ г.", styles["body"])],
            [
                P("<b>Мобильный телефон</b>", styles["label"]),
                P("+7 (___) ___-__-__ &nbsp;&nbsp;☐ записан в базу / чат", styles["body"]),
            ],
            [
                P("<b>Балл теста</b>", styles["label"]),
                P("______ / ______ &nbsp;&nbsp;(______ %)", styles["body"]),
            ],
            [
                P("<b>Фото</b>", styles["label"]),
                P("☐ фото сотрудника сделано / сохранено", styles["body"]),
            ],
        ],
        colWidths=[38 * mm, 142 * mm],
    )
    fields.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 2),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2),
            ]
        )
    )
    story.append(fields)
    story.append(Spacer(1, 2 * mm))

    # Форма и бейджи
    story.append(section_title("0. Форма и бейджи в магазине", styles))
    add_items(
        story,
        styles,
        [
            (
                "Внешний вид / форма по сезону у смены: &nbsp;☐ в порядке &nbsp;☐ есть замечания",
                0,
            ),
            ("Замечания по форме (если есть):", 1),
            (
                "Бейджи у сотрудников на смене: &nbsp;☐ у всех &nbsp;☐ не у всех &nbsp;☐ нет / не печатали",
                0,
            ),
            (
                "На бейдже ФИО + должность + QR: &nbsp;☐ да &nbsp;☐ нет / устарели &nbsp;☐ нужно допечатать",
                0,
            ),
            ("Сколько бейджей нужно допечатать / кому: _________________________________", 0),
        ],
    )

    # 1. TargControl
    story.append(section_title("1. TargControl (учёт рабочего времени)", styles))
    add_items(
        story,
        styles,
        [
            (
                "Работает ли с TargControl: &nbsp;☐ да, регулярно &nbsp;☐ иногда &nbsp;☐ нет / не умеет",
                0,
            ),
            (
                "Как отмечается (приход / уход / перерыв): номер + PIN или карта → событие на терминале/в приложении?",
                1,
            ),
            (
                "Понимает, как работать с программой: &nbsp;☐ уверенно &nbsp;☐ частично &nbsp;☐ нужна демонстрация",
                0,
            ),
            (
                "Что нужно для работы: учётная запись, номер сотрудника + PIN/карта, доступ к терминалу/приложению?",
                1,
            ),
            (
                "Отмечает в момент факта смены (не «потом»); контролирует отметки смены: &nbsp;☐ да &nbsp;☐ нет &nbsp;☐ нужна помощь",
                0,
            ),
            ("Комментарий / что показать на месте:", 1),
        ],
    )

    # 2. Ценники
    story.append(section_title("2. Ценники: история печати и контроль", styles))
    add_items(
        story,
        styles,
        [
            (
                "Пользуется «Историей печати ценников»: &nbsp;☐ да, регулярно &nbsp;☐ иногда &nbsp;☐ нет / не умеет &nbsp;☐ не знает, что это",
                0,
            ),
            ("Зачем нужен контроль ценников? (своими словами)", 1),
            (
                "Как работаете: кто печатает, как сверяете зал и кассу, что делаете, если цена на ценнике и на кассе разная",
                2,
            ),
            (
                "Понимает историю печати и контроль ценников в зале: &nbsp;☐ уверенно &nbsp;☐ частично &nbsp;☐ нужна демонстрация",
                0,
            ),
            ("Комментарий / что показать на месте:", 1),
        ],
    )

    # 3. Комфорт и сложности
    story.append(section_title("3. Комфорт работы и сложности", styles))
    add_items(
        story,
        styles,
        [
            ("Насколько комфортно работать в текущей роли СПК? (1–5): &nbsp;1 &nbsp;2 &nbsp;3 &nbsp;4 &nbsp;5", 0),
            ("Что помогает чувствовать себя уверенно на смене?", 1),
            ("Что даётся сложнее всего? Где «затыки»?", 1),
            ("Чего не хватает для более комфортной работы (инструменты, люди, информация, время)?", 1),
        ],
    )

    # 3. Пара
    story.append(section_title("4. Работа в паре с другим СПК", styles))
    story.extend(
        checkbox_row(
            "Работает в паре с другим СПК: &nbsp;☐ да &nbsp;☐ нет &nbsp;☐ иногда / подмена",
            styles,
            0,
        )
    )
    add_items(
        story,
        styles,
        [
            ("Если да — ФИО напарника: _______________________________________________", 0),
            ("Как делится ответственность и зоны (касса / зал / склад / смена)?", 1),
            ("Что в паре получается хорошо?", 1),
            ("Где возникают трения или дублирование? Как решаете?", 1),
            ("Нужна ли помощь в настройке работы пары? &nbsp;☐ да &nbsp;☐ нет &nbsp;Комментарий:", 1),
        ],
    )

    # 4. Коллектив
    story.append(section_title("5. Коллектив и атмосфера в смене", styles))
    add_items(
        story,
        styles,
        [
            ("Как оцениваете климат в коллективе? (1–5): &nbsp;1 &nbsp;2 &nbsp;3 &nbsp;4 &nbsp;5", 0),
            ("Кто в смене — опора? Есть ли конфликтные точки?", 1),
            ("Как смена реагирует на задачи и обратную связь от СПК?", 1),
            ("Что улучшить во взаимодействии команды?", 1),
        ],
    )

    # 5. База знаний / регламенты / ОС / задачи
    story.append(section_title("6. База знаний, регламенты, обратная связь, сроки задач", styles))
    story.append(P("<b>На встрече показать и отметить:</b>", styles["body"]))
    story.append(Spacer(1, 1 * mm))
    add_items(
        story,
        styles,
        [
            ("Показано, как читать инструкции в базе знаний (где искать, как открывать карточки).", 0),
            ("Показано, как искать регламенты (по теме / ключевому слову / разделу).", 0),
            ("Объяснено, как давать обратную связь сотруднику: факт → влияние → что изменить → срок; наедине.", 0),
            ("Подчёркнуто: задачи нужно выполнять вовремя; просрочки эскалировать, не «копить».", 0),
            ("Сотрудник сам нашёл 1 инструкцию / регламент по теме из теста (практика поиска).", 0),
        ],
    )

    add_items(
        story,
        styles,
        [
            ("Что мешает делать задачи вовремя? (люди, нагрузка, система, неясные приоритеты, другое)", 1),
            ("Какая поддержка нужна от супервайзера / руководителя розницы / офиса?", 1),
        ],
    )

    # 6. Итог встречи
    story.append(section_title("7. Итог встречи и договорённости", styles))
    add_items(
        story,
        styles,
        [
            ("3 главные договорённости / фокуса на ближайшие 2 недели:", 2),
            ("Нужен повторный разбор слабых тем теста: &nbsp;☐ да &nbsp;☐ нет &nbsp;Темы:", 1),
            ("Комментарий проводящего встречу:", 1),
        ],
    )
    # Подписи
    story.append(Spacer(1, 3 * mm))
    signs = Table(
        [
            [
                P("Сотрудник<br/><br/>________________ / _______________", styles["small"]),
                P("Проводящий встречу<br/><br/>________________ / _______________", styles["small"]),
            ]
        ],
        colWidths=[90 * mm, 90 * mm],
    )
    signs.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 2),
            ]
        )
    )
    story.append(signs)
    story.append(Spacer(1, 2 * mm))
    story.append(
        P(
            "Лист сдать руководителю встречи. Фото и телефон — для базы контактов смены. "
            "Анализ по магазинам / темам — по пакету заполненных листов.",
            styles["small"],
        )
    )

    doc.build(story)
    print("OK", OUT)


if __name__ == "__main__":
    build()
