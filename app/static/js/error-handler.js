class ErrorHandler {
    constructor() {
        this.errorContainer = document.getElementById('errorContainer');
        this.initializeGlobalHandlers();
    }

    initializeGlobalHandlers() {
        // Handle all AJAX errors
        $(document).ajaxError((event, jqXHR, settings, error) => {
            this.handleAjaxError(jqXHR);
        });

        // Handle all unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason);
        });

        // Handle all uncaught errors
        window.addEventListener('error', (event) => {
            this.handleError(event.error);
        });
    }

    handleAjaxError(jqXHR) {
        let message;
        
        try {
            const response = JSON.parse(jqXHR.responseText);
            message = response.error || response.message;
        } catch (e) {
            message = jqXHR.statusText;
        }

        switch (jqXHR.status) {
            case 401:
                this.handleUnauthorized();
                break;
            case 403:
                this.showError('You do not have permission to perform this action');
                break;
            case 404:
                this.showError('The requested resource was not found');
                break;
            case 422:
                this.handleValidationErrors(message);
                break;
            case 429:
                this.showError('Too many requests. Please try again later');
                break;
            case 500:
                this.showError('An internal server error occurred. Please try again later');
                break;
            default:
                this.showError(message || 'An unexpected error occurred');
        }
    }

    handleError(error) {
        console.error(error);
        
        if (error instanceof ValidationError) {
            this.handleValidationErrors(error.errors);
        } else if (error instanceof NetworkError) {
            this.showError('Network error occurred. Please check your connection');
        } else {
            this.showError(error.message || 'An unexpected error occurred');
        }
    }

    handleValidationErrors(errors) {
        if (typeof errors === 'string') {
            this.showError(errors);
            return;
        }

        const messages = Object.entries(errors).map(([field, error]) => {
            return `${field}: ${error}`;
        });

        this.showError(messages.join('<br>'));
    }

    handleUnauthorized() {
        // Save current URL for redirect after login
        sessionStorage.setItem('redirectUrl', window.location.href);
        window.location.href = '/login';
    }

    showError(message, duration = 5000) {
        if (!this.errorContainer) return;

        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        this.errorContainer.appendChild(alert);

        if (duration > 0) {
            setTimeout(() => {
                alert.remove();
            }, duration);
        }
    }

    showSuccess(message, duration = 3000) {
        if (!this.errorContainer) return;

        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        this.errorContainer.appendChild(alert);

        if (duration > 0) {
            setTimeout(() => {
                alert.remove();
            }, duration);
        }
    }
}

// Custom error classes
class ValidationError extends Error {
    constructor(errors) {
        super('Validation Error');
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

class NetworkError extends Error {
    constructor(message = 'Network Error') {
        super(message);
        this.name = 'NetworkError';
    }
}

// Initialize error handler
const errorHandler = new ErrorHandler(); 