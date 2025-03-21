from app import db
from app.models.profile import UserProfile, UserAddress
from app.utils.upload import save_image

class ProfileService:
    @staticmethod
    def update_profile(user_id, data):
        """Update user profile information."""
        profile = UserProfile.query.filter_by(user_id=user_id).first()
        
        if not profile:
            profile = UserProfile(user_id=user_id)
            db.session.add(profile)
        
        # Update profile fields
        for field in ['company_name', 'bio', 'website', 'phone', 'timezone', 'language']:
            if field in data:
                setattr(profile, field, data[field])
        
        # Handle avatar upload
        if 'avatar' in data:
            avatar_url = save_image(
                data['avatar'],
                folder='avatars',
                filename=f'user_{user_id}'
            )
            profile.avatar_url = avatar_url
        
        # Update notification preferences
        if 'notification_preferences' in data:
            profile.notification_preferences = data['notification_preferences']
        
        db.session.commit()
        return profile

    @staticmethod
    def add_address(user_id, address_data):
        """Add a new address for user."""
        # If this is the first address or marked as default,
        # unset other default addresses of the same type
        if address_data.get('is_default'):
            UserAddress.query.filter_by(
                user_id=user_id,
                type=address_data['type'],
                is_default=True
            ).update({'is_default': False})
        
        address = UserAddress(user_id=user_id, **address_data)
        db.session.add(address)
        db.session.commit()
        
        return address

    @staticmethod
    def update_address(address_id, address_data):
        """Update an existing address."""
        address = UserAddress.query.get_or_404(address_id)
        
        # If being set as default, unset other default addresses
        if address_data.get('is_default') and not address.is_default:
            UserAddress.query.filter_by(
                user_id=address.user_id,
                type=address.type,
                is_default=True
            ).update({'is_default': False})
        
        # Update address fields
        for field, value in address_data.items():
            setattr(address, field, value)
        
        db.session.commit()
        return address

    @staticmethod
    def delete_address(address_id):
        """Delete an address."""
        address = UserAddress.query.get_or_404(address_id)
        
        # If this was a default address, set another address as default
        if address.is_default:
            new_default = UserAddress.query.filter_by(
                user_id=address.user_id,
                type=address.type
            ).filter(
                UserAddress.id != address_id
            ).first()
            
            if new_default:
                new_default.is_default = True
        
        db.session.delete(address)
        db.session.commit()

    @staticmethod
    def get_addresses(user_id, type=None):
        """Get user addresses, optionally filtered by type."""
        query = UserAddress.query.filter_by(user_id=user_id)
        
        if type:
            query = query.filter_by(type=type)
        
        return query.order_by(UserAddress.is_default.desc()).all()

    @staticmethod
    def get_default_address(user_id, type):
        """Get user's default address of specified type."""
        return UserAddress.query.filter_by(
            user_id=user_id,
            type=type,
            is_default=True
        ).first() 