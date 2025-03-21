from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
import os

class InvoiceGenerator:
    def __init__(self, sale):
        self.sale = sale
        self.output_dir = 'app/static/invoices'
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def generate(self):
        filename = f"{self.output_dir}/invoice_{self.sale.id}.pdf"
        doc = SimpleDocTemplate(filename, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        # Header
        elements.append(Paragraph(f"Invoice #{self.sale.id}", styles['Heading1']))
        elements.append(Paragraph(f"Date: {self.sale.date}", styles['Normal']))

        # Items Table
        data = [['Item', 'Quantity', 'Price', 'Total']]
        for item in self.sale.items:
            data.append([
                item['product_name'],
                item['quantity'],
                f"${item['price']:.2f}",
                f"${item['total']:.2f}"
            ])

        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(table)

        # Total
        elements.append(Paragraph(f"Total: ${self.sale.total:.2f}", styles['Heading2']))
        
        doc.build(elements)
        return f"/static/invoices/invoice_{self.sale.id}.pdf" 