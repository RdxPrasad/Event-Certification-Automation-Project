import os
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from datetime import datetime


CERTIFICATES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "certificates")
os.makedirs(CERTIFICATES_DIR, exist_ok=True)


def generate_certificate(user_name: str, event_title: str, event_date: datetime, cert_id: int) -> str:
    """
    Generate a PDF certificate and return its file path.
    """
    filename = f"certificate_{cert_id}.pdf"
    filepath = os.path.join(CERTIFICATES_DIR, filename)

    width, height = landscape(A4)
    c = canvas.Canvas(filepath, pagesize=landscape(A4))

    # Background color
    c.setFillColor(HexColor("#FDFBF7"))
    c.rect(0, 0, width, height, fill=True)

    # Decorative border
    c.setStrokeColor(HexColor("#1a5276"))
    c.setLineWidth(4)
    c.rect(30, 30, width - 60, height - 60)

    # Inner border
    c.setStrokeColor(HexColor("#d4ac0d"))
    c.setLineWidth(2)
    c.rect(40, 40, width - 80, height - 80)

    # Title
    c.setFillColor(HexColor("#1a5276"))
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(width / 2, height - 120, "CERTIFICATE")

    c.setFont("Helvetica", 20)
    c.drawCentredString(width / 2, height - 155, "OF PARTICIPATION")

    # Decorative line
    c.setStrokeColor(HexColor("#d4ac0d"))
    c.setLineWidth(2)
    c.line(width / 2 - 100, height - 170, width / 2 + 100, height - 170)

    # "This is to certify that"
    c.setFillColor(HexColor("#2c3e50"))
    c.setFont("Helvetica", 16)
    c.drawCentredString(width / 2, height - 210, "This is to certify that")

    # User name
    c.setFillColor(HexColor("#1a5276"))
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width / 2, height - 250, user_name)

    # Underline for name
    name_width = c.stringWidth(user_name, "Helvetica-Bold", 28)
    c.setStrokeColor(HexColor("#d4ac0d"))
    c.setLineWidth(1)
    c.line(width / 2 - name_width / 2, height - 255, width / 2 + name_width / 2, height - 255)

    # "has successfully participated in"
    c.setFillColor(HexColor("#2c3e50"))
    c.setFont("Helvetica", 16)
    c.drawCentredString(width / 2, height - 290, "has successfully participated in")

    # Event title
    c.setFillColor(HexColor("#1a5276"))
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(width / 2, height - 325, event_title)

    # Date
    formatted_date = event_date.strftime("%B %d, %Y")
    c.setFillColor(HexColor("#2c3e50"))
    c.setFont("Helvetica", 14)
    c.drawCentredString(width / 2, height - 365, f"held on {formatted_date}")

    # Issue date
    c.setFont("Helvetica", 11)
    c.drawCentredString(width / 2, height - 400, f"Certificate issued on {datetime.utcnow().strftime('%B %d, %Y')}")

    # Certificate ID
    c.setFont("Helvetica", 9)
    c.setFillColor(HexColor("#7f8c8d"))
    c.drawCentredString(width / 2, 60, f"Certificate ID: CERT-{cert_id:06d}")

    c.save()
    return filepath
