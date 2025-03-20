import cv2
from pyzbar.pyzbar import decode
import numpy as np

class BarcodeScanner:
    @staticmethod
    def decode_barcode_image(image_path):
        image = cv2.imread(image_path)
        barcodes = decode(image)
        
        results = []
        for barcode in barcodes:
            barcode_data = barcode.data.decode('utf-8')
            barcode_type = barcode.type
            results.append({
                'data': barcode_data,
                'type': barcode_type
            })
        
        return results

    @staticmethod
    def validate_barcode(barcode_data):
        # Basic validation for common barcode formats
        if len(barcode_data) not in [8, 12, 13]:  # UPC-E, UPC-A, EAN-13
            return False
        
        try:
            int(barcode_data)  # Ensure all characters are digits
            return True
        except ValueError:
            return False 