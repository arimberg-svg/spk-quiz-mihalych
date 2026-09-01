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

    # Шапка: данные + фото
    photo = Table(
        [
            [P("<b>ФОТО</b><br/><br/><font size='7' color='#5c5278'>сотрудника<br/>(вклеить / приложить)</font>", styles["body"])]
        ],
        colWidths=[38 * mm],
        rowHeights=[42 * mm],
    )
    photo.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 1, PURPLE),
                ("BACKGROUND", (0, 0), (-1, -1), BOX),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ]
        )
    )

    fields = Table(
        [
            [P("<b>ФИО</b>", styles["label"]), P("_______________________________________________", styles["body"])],
            [P("<b>Магазин</b>", styles["label"]), P("_______________________________________________", styles["body"])],
            [P("<b>Должность</b>", styles["label"]), P("_______________________________________________", styles["body"])],
            [P("<b>Дата встречи</b>", styles["label"]), P("«____» _____________ 202__ г.", styles["body"])],
            [
                P("<b>Мобильный телефон</b>", styles["label"]),
                P("+7 (___) ___-__-__ &nbsp;&nbsp;☐ записан в базу / чат", styles["body"]),
            ],
            [
                P("<b>Балл теста</b>", styles["label"]),
                P("______ / ______ &nbsp;&nbsp;(______ %)", styles["body"]),
            ],
        ],
        colWidths=[38 * mm, 100 * mm],
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

    head = Table([[fields, photo]], colWidths=[142 * mm, 42 * mm])
    head.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    story.append(head)
    story.append(Spacer(1, 2 * mm))

    # 1. Комфорт и сложности
    story.append(section_title("1. Комфорт работы и сложности", styles))
    add_items(
        story,
        styles,
        [
            ("Насколько комфортно работать в текущей роли СПК? (1–5): &nbsp;1 &nbsp;2 &nbsp;3 &nbsp;4 &nbsp;5", 0),
            ("Что помогает чувствовать себя уверенно на смене?", 2),
            ("Что даётся сложнее всего? Где «затыки»?", 2),
            ("Чего не хватает для более комфортной работы (инструменты, люди, информация, время)?", 2),
        ],
    )

    # 2. Пара
    story.append(section_title("2. Работа в паре с другим СПК", styles))
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
            ("Как делится ответственность и зоны (касса / зал / склад / смена)?", 2),
            ("Что в паре получается хорошо?", 1),
            ("Где возникают трения или дублирование? Как решаете?", 2),
            ("Нужна ли помощь в настройке работы пары? &nbsp;☐ да &nbsp;☐ нет &nbsp;Комментарий:", 1),
        ],
    )

    # 3. Коллектив
    story.append(section_title("3. Коллектив и атмосфера в смене", styles))
    add_items(
        story,
        styles,
        [
            ("Как оцениваете климат в коллективе? (1–5): &nbsp;1 &nbsp;2 &nbsp;3 &nbsp;4 &nbsp;5", 0),
            ("Кто в смене — опора? Есть ли конфликтные точки?", 2),
            ("Как смена реагирует на задачи и обратную связь от СПК?", 1),
            ("Что улучшить во взаимодействии команды?", 2),
        ],
    )

    # 4. База знаний / регламенты / ОС / задачи
    story.append(section_title("4. База знаний, регламенты, обратная связь, сроки задач", styles))
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
            ("Что мешает делать задачи вовремя? (люди, нагрузка, система, неясные приоритеты, другое)", 2),
            ("Какая поддержка нужна от супервайзера / руководителя розницы / офиса?", 2),
        ],
    )

    # 5. Итог встречи
    story.append(section_title("5. Итог встречи и договорённости", styles))
    add_items(
        story,
        styles,
        [
            ("3 главные договорённости / фокуса на ближайшие 2 недели:", 3),
            ("Нужен повторный разбор слабых тем теста: &nbsp;☐ да &nbsp;☐ нет &nbsp;Темы:", 1),
            ("Комментарий проводящего встречу:", 2),
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
