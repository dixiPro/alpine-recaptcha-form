# Alpine.js Form Handler with Google reCAPTCHA v3

A lightweight and reusable Alpine.js component for handling HTML forms with built-in Google reCAPTCHA v3 support.  
Designed for projects with multiple forms, where creating separate JavaScript handlers becomes inefficient.

---

## 🌟 Features

- Simple Alpine.js integration
- Built-in Google reCAPTCHA v3 support
- Automatic reCAPTCHA script loading
- Automatic token retrieval
- Token is sent together with form data to API
- Async form submission (no page reload)
- Error and success state handling
- Lightweight (~3KB)
- Full UI control
- Supports multiple forms on one page

---

## 🎯 Why This Component Exists

On real projects, websites often contain many different contact or feedback forms.  
Creating and maintaining a separate JavaScript handler for each form leads to duplication and unnecessary complexity.

This component provides a single universal form handler that can be reused across the entire site.

### Key benefits in multi-form scenarios

- One handler for any number of forms
- Works with multiple forms on the same page
- No page reloads — only an API endpoint is required
- No need for dedicated form-processing pages or UI
- Easily adaptable to project-specific needs
- Backend-agnostic solution

---

## 🧩 Backend Compatibility

Can be used with any backend or CMS, including:

- WordPress
- Drupal
- Joomla
- TYPO3
- MODX
- Laravel
- Django
  ...

Only an endpoint that accepts form data and verifies the reCAPTCHA token is required.

---

## 🚀 Quick Start

### 1. Get reCAPTCHA Keys

Register at https://www.google.com/recaptcha/admin

- Site Key — client side
- Secret Key — server side

### 2. Basic Usage Example

```html
<form
  method="post"
  action="/your___Api___Url"
  x-data="formHandler()"
  @submit.prevent="sendForm"
>

  <input type="hidden" name="recaptureKey" value="YOUR_SITE_KEY" />

   <!--  any fileds yout need -->
  <input type="text" name="name" required />
  <input type="email" name="email" required />
  <textarea name="message" required></textarea>

  <button type="submit" :disabled="sending">
    <span x-show="!sending">Submit</span>
    <span x-show="sending">Sending...</span>
  </button>

  <div x-show="errorMsg" x-text="errorMsg"></div>
  <div x-show="done && !errorMsg">Form submitted successfully</div>
</form>

<!-- Alpine Form Handle -->
<script defer src=".../alpine-recaptcha-form.js"></script>

<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

```

---

## 📖 Component State

| Variable        | Type    | Description                       |
| --------------- | ------- | --------------------------------- |
| sending         | Boolean | Form submission in progress       |
| done            | Boolean | Submission completed successfully |
| errorMsg        | String  | Error message                     |
| apiResult       | Object  | Raw API response                  |
| recaptchaLoaded | Boolean | reCAPTCHA script load state       |

---

## 🔁 Server Response Format

Success:

```json
{
  "status": 1,
  "message": "Success"
}
```

Error:

```json
{
  "status": 0,
  "errorMsg": "Error description"
}
```

---

## 🔧 Server-Side Example (PHP)

```php
<?php
header('Content-Type: application/json; charset=utf-8');

$data   = json_decode(file_get_contents('php://input'), true);
$token  = $data['recaptureToken'] ?? '';
$secret = 'YOUR_SECRET_KEY';

$response = file_get_contents(
    "https://www.google.com/recaptcha/api/siteverify?secret=$secret&response=$token"
);

$result = json_decode($response);

if (!$result || !$result->success) {
    echo json_encode(['status' => 0, 'errorMsg' => 'Error']);
    exit;
}

// Form processing...

echo json_encode(['status' => 1, 'message' => 'Success']);

```
---

## ⚙️ Requirements

- Alpine.js 3.x or higher
- Google reCAPTCHA v3
- Modern browser (ES6+)

---

## 📄 License

MIT License — free for personal and commercial use.

---

Built for projects where forms should be simple, reusable, and backend-agnostic.
