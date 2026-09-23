"""Build the public classroom PDFs from the same content used by the web page.

Requires reportlab and pypdf. Run from any directory with Python 3.
Final copies go to output/pdf and public/downloads/educators.
"""
import json
import shutil
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "data/educator-resources.json").read_text(encoding="utf-8"))
OUTPUT = ROOT / "output/pdf"
PUBLIC = ROOT / "public/downloads/educators"
OUTPUT.mkdir(parents=True, exist_ok=True)
PUBLIC.mkdir(parents=True, exist_ok=True)
INK = colors.HexColor("#172b31")
MUTED = colors.HexColor("#47565b")
LINE = colors.HexColor("#b8c1c3")
BODY = ParagraphStyle("body", fontName="Helvetica", fontSize=10.5, leading=14.5, textColor=INK)
SMALL = ParagraphStyle("small", parent=BODY, fontSize=8, leading=10.5)
HEADING = ParagraphStyle("heading", parent=BODY, fontName="Helvetica-Bold", fontSize=12, leading=16)
WIDTH = 516


def para(c, text, y, style=BODY):
    p = Paragraph(text, style)
    _, height = p.wrap(WIDTH, 720)
    if y - height < 62:
        raise ValueError(f"Content overflow: {text[:70]}")
    p.drawOn(c, 48, y - height)
    return y - height - 8


def header(c, resource, subtitle, page, total):
    c.setTitle(resource["title"])
    c.setAuthor("Saint Discovery")
    c.setSubject(resource["description"])
    c.drawImage(str(ROOT / "public/icons/saint-discovery-v2-256.png"), 48, 735, width=38, height=38, mask="auto")
    c.setFillColor(INK)
    c.setFont("Times-Bold", 17)
    c.drawString(96, 755, "Saint Discovery")
    c.setFillColor(MUTED)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(96, 740, "FOR TEACHERS & CATECHISTS")
    c.setFillColor(INK)
    c.setFont("Times-Bold", 28)
    c.drawString(48, 711, resource["title"])
    c.setFont("Helvetica", 11)
    c.drawString(48, 689, subtitle)
    c.setStrokeColor(LINE)
    c.line(48, 675, 564, 675)
    c.line(48, 47, 564, 47)
    c.setFont("Helvetica", 8)
    c.setFillColor(MUTED)
    c.drawString(48, 32, "saintdiscoveryquiz.com/resources/teachers | Free classroom & parish use")
    c.linkURL("https://www.saintdiscoveryquiz.com/resources/teachers", (48, 28, 445, 42), relative=0)
    c.drawRightString(564, 32, f"{page} / {total}")


def worksheet():
    resource = DATA["worksheet"]
    c = canvas.Canvas(str(OUTPUT / resource["filename"]), pagesize=(612, 792), invariant=1)
    for index, page in enumerate(resource["pages"]):
        header(c, resource, page["title"], index + 1, 2)
        y = para(c, escape(page["intro"]), 657) - 4
        for field in page["fields"]:
            y = para(c, f'<b>{escape(field["label"])}</b>', y)
            c.setStrokeColor(LINE)
            c.setLineWidth(.45)
            for _ in range(field["lines"]):
                y -= 20
                if y < 66:
                    raise ValueError("Worksheet lines overflow")
                c.line(48, y, 564, y)
            y -= 17
        c.showPage()
    c.save()


def lesson():
    resource = DATA["lesson"]
    c = canvas.Canvas(str(OUTPUT / resource["filename"]), pagesize=(612, 792), invariant=1)
    for index, page in enumerate(resource["pages"]):
        header(c, resource, page["title"], index + 1, 3)
        y = 657
        for section in page["sections"]:
            y = para(c, escape(section["title"]), y, HEADING)
            for body in section["body"]:
                y = para(c, escape(body), y)
            y -= 2
        if index == 2:
            y = para(c, "Sources (click to read)", y, HEADING)
            for i, source in enumerate(DATA["sources"]):
                y = para(c, f'{i+1}. <link href="{escape(source["url"])}" color="#244e58"><u>{escape(source["label"])}</u></link>', y, SMALL)
            y = para(c, escape(DATA["permission"]), y, SMALL)
        c.showPage()
    c.save()


worksheet()
lesson()
for key, expected in (("worksheet", 2), ("lesson", 3)):
    pdf = OUTPUT / DATA[key]["filename"]
    reader = PdfReader(pdf)
    assert len(reader.pages) == expected
    assert all(page.extract_text().strip() for page in reader.pages)
    shutil.copyfile(pdf, PUBLIC / pdf.name)
    print(f"Created {pdf.name}: {expected} pages, {pdf.stat().st_size} bytes")
