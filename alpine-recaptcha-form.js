/**
 * Alpine.js Form Handler with Google reCAPTCHA v3
 * 
 * A component for handling forms with Google reCAPTCHA v3 integration
 * 
 * @version 1.0.0
 * @license MIT
 */

document.addEventListener('alpine:init', () => {
  Alpine.data('formHandler', () => ({
    errorMsg: '',
    sending: false,
    done: false,
    apiResult: {},
    recaptureKey: '',
    recaptureToken: '',
    recaptchaLoaded: false,

    /**
     * Returns the current component instance
     */
    getThis() {
      return this;
    },

    /**
     * Component initialization
     * Loads reCAPTCHA script when component is created
     */
    async init() {
      const form = this.$el;
      // Get reCAPTCHA key from hidden input
      this.recaptureKey = form.querySelector('input[name="recaptureKey"]').value;
      
      try {
        this.recaptchaLoaded = await loadScriptToHead(this.recaptureKey);
        if (!this.recaptchaLoaded) {
          this.errorMsg = 'reCAPTCHA script load failed';
        }
      } catch (e) {
        this.errorMsg = 'Error load reCAPTCHA, reload page';
        this.recaptchaLoaded = false;
      }
    },

    /**
     * Form submission handler
     * @param {Event} event - form submit event
     */
    async sendForm(event) {
      event.preventDefault();
      
      if (this.sending) return;

      this.errorMsg = '';
      this.done = false;
      this.apiResult = {};
      this.sending = true;

      try {
        // Get reCAPTCHA token
        this.recaptureToken = await grecaptchaGetToken(this.recaptureKey);
        if (!this.recaptureToken) {
          throw new Error('Error get reCAPTCHA token, reload page');
        }

        const form = event.target;
        const formData = new FormData(form);
        const params = Object.fromEntries(formData.entries());
        params.recaptureToken = this.recaptureToken;

        const url = form.getAttribute('action') || window.location.href;

        // Send data to server
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'X-Requested-With': 'XMLapiCallRequest',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error('net error');
        }

        let apiResult;
        try {
          apiResult = await response.json();
        } catch (error) {
          throw new Error('server 500 error');
        }

        if ((apiResult?.status || 0) != 1) {
          throw new Error(apiResult?.errorMsg || 'Unknown error');
        }

        this.apiResult = apiResult;
        this.done = true;

      } catch (e) {
        console.log(e);
        this.errorMsg = e.message;
      } finally {
        this.sending = false;
        // Auto-hide error message after 6 seconds
        setTimeout(() => (this.errorMsg = ''), 6000);
      }
    },
  }));
});

/**
 * Gets reCAPTCHA token
 * @param {string} recaptureKey - reCAPTCHA site key
 * @returns {Promise<string>} reCAPTCHA token
 */
async function grecaptchaGetToken(recaptureKey) {
  try {
    // Wait for grecaptcha to be ready
    await new Promise((resolve) => {
      grecaptcha.ready(() => resolve());
    });

    // Execute reCAPTCHA
    const token = await grecaptcha.execute(recaptureKey, { action: 'homepage' });
    return token;
  } catch (error) {
    console.error('reCAPTCHA error:', error);
    return '';
  }
}

/**
 * Loads reCAPTCHA script into head if not already present
 * @param {string} recaptureKey - reCAPTCHA site key
 * @returns {Promise<boolean>} true if script loaded successfully, false otherwise
 */
function loadScriptToHead(recaptureKey) {
  return new Promise((resolve) => {
    const scriptUrl = `https://www.google.com/recaptcha/api.js?render=${recaptureKey}`;

    try {
      const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
      
      if (existingScript) {
        // If script was already loaded previously
        if (existingScript.dataset.loaded === '1') return resolve(true);
        if (existingScript.dataset.error === '1') return resolve(false);

        // Wait for actual load/error event
        existingScript.addEventListener('load', () => resolve(true), { once: true });
        existingScript.addEventListener('error', () => resolve(false), { once: true });
        return;
      }

      // Create new script element
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;

      script.addEventListener(
        'load',
        () => {
          script.dataset.loaded = '1';
          resolve(true);
        },
        { once: true }
      );

      script.addEventListener(
        'error',
        () => {
          script.dataset.error = '1';
          resolve(false);
        },
        { once: true }
      );

      document.head.appendChild(script);
    } catch (error) {
      console.error('loadScriptToHead error:', error);
      resolve(false);
    }
  });
}
