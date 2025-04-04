import pyotp
import qrcode
from io import BytesIO
from typing import Tuple
from ..core.logging import logger

class TwoFactorAuth:
    def __init__(self):
        self.totp = pyotp.TOTP

    def generate_secret(self) -> str:
        """
        Generate a new secret key for 2FA.
        """
        return pyotp.random_base32()

    def generate_qr_code(self, secret: str, email: str) -> BytesIO:
        """
        Generate a QR code for 2FA setup.
        """
        provisioning_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            email,
            issuer_name="Your App Name"
        )
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        img_byte_arr = BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        return img_byte_arr

    def verify_token(self, secret: str, token: str) -> bool:
        """
        Verify a 2FA token.
        """
        totp = self.totp(secret)
        is_valid = totp.verify(token)
        logger.info(f"2FA token verification {'successful' if is_valid else 'failed'}")
        return is_valid

    def get_current_token(self, secret: str) -> str:
        """
        Get the current valid token.
        """
        totp = self.totp(secret)
        return totp.now()

two_factor_auth = TwoFactorAuth() 