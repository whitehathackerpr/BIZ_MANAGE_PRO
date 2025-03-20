class ProfileManager {
    constructor() {
        this.addressTypes = ['shipping', 'billing'];
        this.currentAddresses = new Map();
        this.avatarUploader = null;
    }

    init() {
        // Initialize components
        this.initializeAvatarUploader();
        this.initializeFormValidation();
        this.initializeAddressManagement();
        
        // Load initial data
        this.loadProfile();
        this.loadAddresses();
        
        // Add event listeners
        this.addEventListeners();
    }

    initializeAvatarUploader() {
        const uploadButton = document.getElementById('avatarUpload');
        if (!uploadButton) return;

        this.avatarUploader = new FileUploader({
            button: uploadButton,
            accept: 'image/*',
            maxSize: 5 * 1024 * 1024, // 5MB
            onSelect: (file) => this.handleAvatarSelect(file),
            onError: (error) => showError(error)
        });
    }

    async handleAvatarSelect(file) {
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await fetch('/api/profile/avatar', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to upload avatar');

            const data = await response.json();
            document.getElementById('avatarImage').src = data.avatar_url;
            showSuccess('Avatar updated successfully');
        } catch (error) {
            showError('Failed to upload avatar: ' + error.message);
        }
    }

    async loadProfile() {
        try {
            const response = await fetch('/api/profile');
            const profile = await response.json();

            // Populate form fields
            Object.keys(profile).forEach(key => {
                const input = document.getElementById(key);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = profile[key];
                    } else {
                        input.value = profile[key];
                    }
                }
            });

            // Update avatar if exists
            if (profile.avatar_url) {
                document.getElementById('avatarImage').src = profile.avatar_url;
            }

            // Set notification preferences
            if (profile.notification_preferences) {
                this.updateNotificationPreferences(profile.notification_preferences);
            }
        } catch (error) {
            showError('Failed to load profile: ' + error.message);
        }
    }

    async loadAddresses() {
        try {
            const response = await fetch('/api/profile/addresses');
            const addresses = await response.json();

            this.currentAddresses.clear();
            addresses.forEach(addr => this.currentAddresses.set(addr.id, addr));

            this.renderAddresses();
        } catch (error) {
            showError('Failed to load addresses: ' + error.message);
        }
    }

    renderAddresses() {
        this.addressTypes.forEach(type => {
            const container = document.getElementById(`${type}Addresses`);
            if (!container) return;

            const addresses = Array.from(this.currentAddresses.values())
                .filter(addr => addr.type === type);

            container.innerHTML = addresses.map(addr => `
                <div class="address-card ${addr.is_default ? 'default' : ''}" 
                     data-address-id="${addr.id}">
                    <div class="address-content">
                        <strong>${addr.name}</strong>
                        ${addr.company ? `<br>${addr.company}` : ''}
                        <br>${addr.street}
                        <br>${addr.city}, ${addr.state} ${addr.postal_code}
                        <br>${addr.country}
                        ${addr.phone ? `<br>Phone: ${addr.phone}` : ''}
                    </div>
                    <div class="address-actions">
                        ${!addr.is_default ? `
                            <button class="btn btn-sm btn-outline-primary set-default-btn"
                                    data-address-id="${addr.id}">
                                Set as Default
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-outline-secondary edit-address-btn"
                                data-address-id="${addr.id}">
                            Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-address-btn"
                                data-address-id="${addr.id}">
                            Delete
                        </button>
                    </div>
                </div>
            `).join('');
        });
    }

    async saveProfile(formData) {
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });

            if (!response.ok) throw new Error('Failed to update profile');

            showSuccess('Profile updated successfully');
        } catch (error) {
            showError('Failed to save profile: ' + error.message);
        }
    }

    async saveAddress(formData) {
        try {
            const addressId = formData.get('id');
            const method = addressId ? 'PUT' : 'POST';
            const url = addressId ? 
                `/api/profile/addresses/${addressId}` : 
                '/api/profile/addresses';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });

            if (!response.ok) throw new Error('Failed to save address');

            await this.loadAddresses();
            $('#addressModal').modal('hide');
            showSuccess('Address saved successfully');
        } catch (error) {
            showError('Failed to save address: ' + error.message);
        }
    }

    async deleteAddress(addressId) {
        try {
            const response = await fetch(`/api/profile/addresses/${addressId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete address');

            this.currentAddresses.delete(addressId);
            this.renderAddresses();
            showSuccess('Address deleted successfully');
        } catch (error) {
            showError('Failed to delete address: ' + error.message);
        }
    }

    addEventListeners() {
        // Profile form submission
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.saveProfile(formData);
        });

        // Address form submission
        document.getElementById('addressForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.saveAddress(formData);
        });

        // Address card actions
        document.addEventListener('click', (e) => {
            const addressId = e.target.dataset.addressId;
            if (!addressId) return;

            if (e.target.classList.contains('edit-address-btn')) {
                this.editAddress(addressId);
            } else if (e.target.classList.contains('delete-address-btn')) {
                if (confirm('Are you sure you want to delete this address?')) {
                    this.deleteAddress(addressId);
                }
            } else if (e.target.classList.contains('set-default-btn')) {
                this.setDefaultAddress(addressId);
            }
        });

        // New address button
        document.getElementById('newAddressBtn').addEventListener('click', () => {
            document.getElementById('addressForm').reset();
            document.getElementById('addressId').value = '';
            $('#addressModal').modal('show');
        });
    }

    editAddress(addressId) {
        const address = this.currentAddresses.get(parseInt(addressId));
        if (!address) return;

        // Populate form
        const form = document.getElementById('addressForm');
        Object.keys(address).forEach(key => {
            const input = form.elements[key];
            if (input) {
                input.value = address[key];
            }
        });

        $('#addressModal').modal('show');
    }

    async setDefaultAddress(addressId) {
        try {
            const response = await fetch(`/api/profile/addresses/${addressId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    is_default: true
                })
            });

            if (!response.ok) throw new Error('Failed to set default address');

            await this.loadAddresses();
            showSuccess('Default address updated');
        } catch (error) {
            showError('Failed to set default address: ' + error.message);
        }
    }
}

// Initialize profile manager
const profileManager = new ProfileManager();
document.addEventListener('DOMContentLoaded', () => {
    profileManager.init();
}); 