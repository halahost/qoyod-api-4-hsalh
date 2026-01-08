/**
 * Qoyod API Tester - Main Application Logic
 * Supports all 19 Qoyod API resources with Arabic/English localization
 */

// ============================================
// Configuration & Constants
// ============================================
// Use proxy server to avoid CORS issues
// When running via server.js, requests go through /api/* proxy
// Fallback to direct API for testing with CORS browser extensions
const USE_PROXY = window.location.protocol !== 'file:';
const API_BASE_URL = USE_PROXY ? '/api' : 'https://api.qoyod.com/2.0';

const RESOURCES = {
    accounts: {
        nameAr: 'الحسابات',
        nameEn: 'Accounts',
        endpoint: '/accounts',
        operations: ['list', 'show', 'create'],
        fields: {
            create: ['name', 'account_type', 'code', 'description']
        }
    },
    products: {
        nameAr: 'المنتجات',
        nameEn: 'Products',
        endpoint: '/products',
        operations: ['list', 'show', 'create', 'update'],
        fields: {
            create: ['name', 'sku', 'selling_price', 'buying_price', 'description', 'track_quantity', 'category_id', 'unit_id'],
            update: ['name', 'sku', 'selling_price', 'buying_price', 'description']
        }
    },
    inventories: {
        nameAr: 'المخازن',
        nameEn: 'Inventories',
        endpoint: '/inventories',
        operations: ['list', 'show', 'create', 'update'],
        fields: {
            create: ['name', 'code', 'description', 'address'],
            update: ['name', 'code', 'description', 'address']
        }
    },
    product_categories: {
        nameAr: 'تصنيفات المنتجات',
        nameEn: 'Product Categories',
        endpoint: '/product_categories',
        operations: ['list', 'show', 'create', 'update'],
        fields: {
            create: ['name', 'parent_id'],
            update: ['name', 'parent_id']
        }
    },
    product_units: {
        nameAr: 'وحدات القياس',
        nameEn: 'Product Units',
        endpoint: '/product_units',
        operations: ['list', 'show', 'create'],
        fields: {
            create: ['name', 'abbreviation']
        }
    },
    vendors: {
        nameAr: 'الموردين',
        nameEn: 'Vendors',
        endpoint: '/vendors',
        operations: ['list', 'show', 'create', 'update'],
        fields: {
            create: ['name', 'email', 'contact_name', 'phone', 'tax_number', 'address', 'city', 'country'],
            update: ['name', 'email', 'contact_name', 'phone', 'tax_number', 'address']
        }
    },
    purchase_orders: {
        nameAr: 'أوامر الشراء',
        nameEn: 'Purchase Orders',
        endpoint: '/purchase_orders',
        operations: ['list', 'show', 'create'],
        fields: {
            create: ['vendor_id', 'date', 'reference', 'description', 'line_items']
        }
    },
    bills: {
        nameAr: 'فواتير المشتريات',
        nameEn: 'Bills',
        endpoint: '/bills',
        operations: ['list', 'show', 'create', 'delete'],
        fields: {
            create: ['vendor_id', 'date', 'due_date', 'reference', 'description', 'line_items']
        }
    },
    bill_payments: {
        nameAr: 'سداد الفواتير',
        nameEn: 'Bill Payments',
        endpoint: '/bill_payments',
        operations: ['list', 'show', 'create'],
        fields: {
            create: ['bill_id', 'account_id', 'amount', 'date', 'reference']
        }
    },
    simple_bills: {
        nameAr: 'الفواتير المبسطة',
        nameEn: 'Simple Bills',
        endpoint: '/simple_bills',
        operations: ['list', 'show', 'create', 'update', 'delete'],
        fields: {
            create: ['account_id', 'date', 'amount', 'description', 'reference'],
            update: ['account_id', 'date', 'amount', 'description', 'reference']
        }
    },
    simple_bill_payments: {
        nameAr: 'سداد الفواتير المبسطة',
        nameEn: 'Simple Bill Payments',
        endpoint: '/simple_bill_payments',
        operations: ['list', 'show', 'create'],
        fields: {
            create: ['simple_bill_id', 'account_id', 'amount', 'date', 'reference']
        }
    },
    debit_notes: {
        nameAr: 'إشعارات المدين',
        nameEn: 'Debit Notes',
        endpoint: '/debit_notes',
        operations: ['list', 'show', 'create', 'delete'],
        fields: {
            create: ['vendor_id', 'bill_id', 'date', 'description', 'line_items']
        }
    },
    customers: {
        nameAr: 'العملاء',
        nameEn: 'Customers',
        endpoint: '/customers',
        operations: ['list', 'show', 'create', 'update'],
        fields: {
            create: ['name', 'email', 'contact_name', 'phone', 'tax_number', 'address', 'city', 'country'],
            update: ['name', 'email', 'contact_name', 'phone', 'tax_number', 'address']
        }
    },
    quotes: {
        nameAr: 'عروض الأسعار',
        nameEn: 'Quotes',
        endpoint: '/quotes',
        operations: ['list', 'show', 'create', 'update'],
        fields: {
            create: ['customer_id', 'date', 'expiry_date', 'reference', 'description', 'line_items'],
            update: ['customer_id', 'date', 'expiry_date', 'reference', 'description']
        }
    },
    invoices: {
        nameAr: 'فواتير المبيعات',
        nameEn: 'Invoices',
        endpoint: '/invoices',
        operations: ['list', 'show', 'create', 'update', 'delete'],
        fields: {
            create: ['customer_id', 'date', 'due_date', 'reference', 'description', 'line_items'],
            update: ['customer_id', 'date', 'due_date', 'reference', 'description']
        }
    },
    invoice_payments: {
        nameAr: 'تحصيل الفواتير',
        nameEn: 'Invoice Payments',
        endpoint: '/invoice_payments',
        operations: ['list', 'show', 'create'],
        fields: {
            create: ['invoice_id', 'account_id', 'amount', 'date', 'reference']
        }
    },
    credit_notes: {
        nameAr: 'إشعارات الدائن',
        nameEn: 'Credit Notes',
        endpoint: '/credit_notes',
        operations: ['list', 'show', 'create', 'delete'],
        fields: {
            create: ['customer_id', 'invoice_id', 'date', 'description', 'line_items']
        }
    },
    receipts: {
        nameAr: 'الإيصالات',
        nameEn: 'Receipts',
        endpoint: '/receipts',
        operations: ['list', 'show', 'create'],
        fields: {
            create: ['customer_id', 'account_id', 'amount', 'date', 'reference', 'description']
        }
    },
    journal_entries: {
        nameAr: 'القيود اليومية',
        nameEn: 'Journal Entries',
        endpoint: '/journal_entries',
        operations: ['list', 'show', 'create', 'delete'],
        fields: {
            create: ['date', 'reference', 'description', 'line_items']
        }
    }
};

// Field labels translations
const FIELD_LABELS = {
    ar: {
        name: 'الاسم',
        email: 'البريد الإلكتروني',
        phone: 'الهاتف',
        address: 'العنوان',
        city: 'المدينة',
        country: 'الدولة',
        description: 'الوصف',
        code: 'الرمز',
        date: 'التاريخ',
        due_date: 'تاريخ الاستحقاق',
        expiry_date: 'تاريخ الانتهاء',
        reference: 'المرجع',
        amount: 'المبلغ',
        sku: 'رمز المنتج',
        selling_price: 'سعر البيع',
        buying_price: 'سعر الشراء',
        track_quantity: 'تتبع الكمية',
        category_id: 'معرف التصنيف',
        unit_id: 'معرف الوحدة',
        parent_id: 'المعرف الأب',
        abbreviation: 'الاختصار',
        tax_number: 'الرقم الضريبي',
        contact_name: 'اسم جهة الاتصال',
        vendor_id: 'معرف المورد',
        customer_id: 'معرف العميل',
        account_id: 'معرف الحساب',
        bill_id: 'معرف الفاتورة',
        invoice_id: 'معرف فاتورة المبيعات',
        simple_bill_id: 'معرف الفاتورة المبسطة',
        account_type: 'نوع الحساب',
        line_items: 'البنود (JSON)'
    },
    en: {
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        address: 'Address',
        city: 'City',
        country: 'Country',
        description: 'Description',
        code: 'Code',
        date: 'Date',
        due_date: 'Due Date',
        expiry_date: 'Expiry Date',
        reference: 'Reference',
        amount: 'Amount',
        sku: 'SKU',
        selling_price: 'Selling Price',
        buying_price: 'Buying Price',
        track_quantity: 'Track Quantity',
        category_id: 'Category ID',
        unit_id: 'Unit ID',
        parent_id: 'Parent ID',
        abbreviation: 'Abbreviation',
        tax_number: 'Tax Number',
        contact_name: 'Contact Name',
        vendor_id: 'Vendor ID',
        customer_id: 'Customer ID',
        account_id: 'Account ID',
        bill_id: 'Bill ID',
        invoice_id: 'Invoice ID',
        simple_bill_id: 'Simple Bill ID',
        account_type: 'Account Type',
        line_items: 'Line Items (JSON)'
    }
};

// UI Translations
const UI_TRANSLATIONS = {
    ar: {
        apiTester: 'اختبار واجهة قيود البرمجية',
        apiKey: 'مفتاح API',
        enterApiKey: 'أدخل مفتاح API الخاص بك',
        connected: 'متصل',
        notConnected: 'غير متصل',
        listAll: 'عرض الكل',
        showOne: 'عرض واحد',
        create: 'إضافة',
        update: 'تعديل',
        delete: 'حذف',
        request: 'الطلب',
        response: 'الاستجابة',
        params: 'المعاملات',
        requestBody: 'جسم الطلب (JSON)',
        formatJson: 'تنسيق JSON',
        sendRequest: 'إرسال الطلب',
        body: 'الجسم',
        headers: 'الترويسات',
        noRequestYet: 'لم يتم إرسال طلب بعد',
        loading: 'جاري التحميل...',
        success: 'نجاح',
        error: 'خطأ',
        warning: 'تحذير',
        resourceId: 'معرف المورد',
        page: 'الصفحة',
        perPage: 'لكل صفحة',
        welcome: 'مرحباً بك في أداة اختبار واجهة قيود البرمجية',
        selectResource: 'اختر مورداً من القائمة الجانبية للبدء في اختبار نقاط النهاية',
        quickStart: 'البدء السريع',
        step1: 'أدخل مفتاح API الخاص بك في الحقل المخصص',
        step2: 'اختر مورداً للاختبار من القائمة الجانبية',
        step3: 'اختر العملية المطلوبة (عرض، إضافة، تعديل، حذف)',
        step4: 'راجع النتائج في منطقة الاستجابة',
        operationNotSupported: 'هذه العملية غير مدعومة لهذا المورد',
        apiKeyRequired: 'الرجاء إدخال مفتاح API',
        idRequired: 'الرجاء إدخال معرف المورد'
    },
    en: {
        apiTester: 'Qoyod API Tester',
        apiKey: 'API Key',
        enterApiKey: 'Enter your API key',
        connected: 'Connected',
        notConnected: 'Not connected',
        listAll: 'List All',
        showOne: 'Show One',
        create: 'Create',
        update: 'Update',
        delete: 'Delete',
        request: 'Request',
        response: 'Response',
        params: 'Parameters',
        requestBody: 'Request Body (JSON)',
        formatJson: 'Format JSON',
        sendRequest: 'Send Request',
        body: 'Body',
        headers: 'Headers',
        noRequestYet: 'No request sent yet',
        loading: 'Loading...',
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        resourceId: 'Resource ID',
        page: 'Page',
        perPage: 'Per Page',
        welcome: 'Welcome to Qoyod API Tester',
        selectResource: 'Select a resource from the sidebar to start testing endpoints',
        quickStart: 'Quick Start',
        step1: 'Enter your API key in the designated field',
        step2: 'Select a resource to test from the sidebar',
        step3: 'Choose the desired operation (List, Create, Update, Delete)',
        step4: 'Review the results in the response area',
        operationNotSupported: 'This operation is not supported for this resource',
        apiKeyRequired: 'Please enter an API key',
        idRequired: 'Please enter a resource ID'
    }
};

// ============================================
// State Management
// ============================================
let state = {
    currentLang: 'ar',
    currentResource: null,
    currentOperation: 'list',
    apiKey: '',
    responseHeaders: null,
    cachedData: {
        accounts: [],
        categories: [],
        product_categories: [],
        units: [],
        product_units: [],
        inventories: [],
        vendors: [],
        customers: [],
        products: []
    }
};

// ============================================
// DOM Elements
// ============================================
const elements = {
    langSwitch: document.getElementById('lang-switch'),
    apiKeyInput: document.getElementById('api-key'),
    toggleKeyBtn: document.getElementById('toggle-key'),
    connectionStatus: document.getElementById('connection-status'),
    welcomeScreen: document.getElementById('welcome-screen'),
    resourcePanel: document.getElementById('resource-panel'),
    resourceTitle: document.getElementById('resource-title'),
    operationsTabs: document.querySelectorAll('.tab-btn'),
    requestMethod: document.getElementById('request-method'),
    requestUrl: document.getElementById('request-url'),
    paramsSection: document.getElementById('params-section'),
    paramsContainer: document.getElementById('params-container'),
    bodySection: document.getElementById('body-section'),
    requestBody: document.getElementById('request-body'),
    formatJsonBtn: document.getElementById('format-json'),
    sendRequestBtn: document.getElementById('send-request'),
    responseStatus: document.getElementById('response-status'),
    responseTime: document.getElementById('response-time'),
    responseContent: document.getElementById('response-content'),
    responseTabs: document.querySelectorAll('.resp-tab-btn'),
    toastContainer: document.getElementById('toast-container'),
    loadingOverlay: document.getElementById('loading-overlay'),
    navItems: document.querySelectorAll('.nav-item')
};

// ============================================
// Utility Functions
// ============================================
function t(key) {
    return UI_TRANSLATIONS[state.currentLang][key] || key;
}

function getFieldLabel(field) {
    return FIELD_LABELS[state.currentLang][field] || field;
}

function showToast(message, type = 'info') {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function showLoading() {
    elements.loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    elements.loadingOverlay.classList.add('hidden');
}

function formatJSON(obj) {
    return JSON.stringify(obj, null, 2);
}

function syntaxHighlight(json) {
    if (typeof json !== 'string') {
        json = JSON.stringify(json, null, 2);
    }

    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'json-number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'json-key';
            } else {
                cls = 'json-string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'json-boolean';
        } else if (/null/.test(match)) {
            cls = 'json-null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

// ============================================
// Language Switching
// ============================================
function toggleLanguage() {
    state.currentLang = state.currentLang === 'ar' ? 'en' : 'ar';
    document.documentElement.lang = state.currentLang;
    document.documentElement.dir = state.currentLang === 'ar' ? 'rtl' : 'ltr';

    elements.langSwitch.textContent = state.currentLang === 'ar' ? 'EN' : 'عربي';

    updateUILabels();

    if (state.currentResource) {
        updateResourcePanel();
    }
}

function updateUILabels() {
    // Update header
    document.querySelector('.logo h1').textContent = t('apiTester');

    // Update API key section
    document.querySelector('.api-key-section label').textContent = t('apiKey');
    elements.apiKeyInput.placeholder = t('enterApiKey');

    // Update connection status
    const statusText = elements.connectionStatus.querySelector('.status-text');
    statusText.textContent = state.apiKey ? t('connected') : t('notConnected');

    // Update welcome screen
    document.querySelector('.welcome-screen h2').textContent = t('welcome');
    document.querySelector('.welcome-screen > p').textContent = t('selectResource');
    document.querySelector('.quick-start h3').textContent = t('quickStart');

    // Update navigation items
    elements.navItems.forEach(item => {
        const resource = item.dataset.resource;
        if (RESOURCES[resource]) {
            const span = item.querySelector('span:last-child');
            span.textContent = state.currentLang === 'ar' ? RESOURCES[resource].nameAr : RESOURCES[resource].nameEn;
        }
    });

    // Update section titles
    const sectionTitles = {
        'الحسابات': 'Accounts',
        'المنتجات والمخزون': 'Products & Inventory',
        'المشتريات': 'Purchases',
        'المبيعات': 'Sales',
        'المحاسبة': 'Accounting'
    };

    document.querySelectorAll('.nav-title').forEach(title => {
        const currentText = title.textContent;
        if (state.currentLang === 'en') {
            for (const [ar, en] of Object.entries(sectionTitles)) {
                if (currentText === ar) {
                    title.textContent = en;
                    break;
                }
            }
        } else {
            for (const [ar, en] of Object.entries(sectionTitles)) {
                if (currentText === en) {
                    title.textContent = ar;
                    break;
                }
            }
        }
    });
}

// ============================================
// API Key Management
// ============================================
function toggleApiKeyVisibility() {
    const type = elements.apiKeyInput.type;
    elements.apiKeyInput.type = type === 'password' ? 'text' : 'password';
}

function updateConnectionStatus() {
    state.apiKey = elements.apiKeyInput.value.trim();
    const statusText = elements.connectionStatus.querySelector('.status-text');

    if (state.apiKey) {
        elements.connectionStatus.classList.add('connected');
        statusText.textContent = t('connected');
    } else {
        elements.connectionStatus.classList.remove('connected');
        statusText.textContent = t('notConnected');
    }
}

// ============================================
// Resource Management
// ============================================
function selectResource(resourceKey) {
    state.currentResource = resourceKey;
    state.currentOperation = 'list';

    // Update nav active state
    elements.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.resource === resourceKey);
    });

    // Show resource panel
    elements.welcomeScreen.classList.add('hidden');
    elements.resourcePanel.classList.remove('hidden');

    updateResourcePanel();
}

function updateResourcePanel() {
    const resource = RESOURCES[state.currentResource];
    if (!resource) return;

    // Update title
    elements.resourceTitle.textContent = state.currentLang === 'ar' ? resource.nameAr : resource.nameEn;

    // Update operations tabs
    elements.operationsTabs.forEach(tab => {
        const operation = tab.dataset.operation;
        const isSupported = resource.operations.includes(operation);
        tab.style.display = isSupported ? 'flex' : 'none';
        tab.classList.toggle('active', operation === state.currentOperation);
    });

    // Update tab labels
    updateOperationTabs();

    // Update request section
    updateRequestSection();
}

function updateOperationTabs() {
    const operationLabels = {
        list: t('listAll'),
        show: t('showOne'),
        create: t('create'),
        update: t('update'),
        delete: t('delete')
    };

    elements.operationsTabs.forEach(tab => {
        const operation = tab.dataset.operation;
        const badge = tab.querySelector('.method-badge');
        const textNode = tab.childNodes[tab.childNodes.length - 1];
        if (textNode.nodeType === Node.TEXT_NODE) {
            textNode.textContent = '\n                        ' + operationLabels[operation] + '\n                    ';
        }
    });
}

function selectOperation(operation) {
    const resource = RESOURCES[state.currentResource];
    if (!resource.operations.includes(operation)) {
        showToast(t('operationNotSupported'), 'warning');
        return;
    }

    state.currentOperation = operation;

    elements.operationsTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.operation === operation);
    });

    updateRequestSection();
}

// ============================================
// Request Section Management
// ============================================
function updateRequestSection() {
    const resource = RESOURCES[state.currentResource];
    const operation = state.currentOperation;

    // Update method and URL
    const methods = {
        list: 'GET',
        show: 'GET',
        create: 'POST',
        update: 'PUT',
        delete: 'DELETE'
    };

    const method = methods[operation];
    elements.requestMethod.textContent = method;
    elements.requestMethod.className = 'method ' + method.toLowerCase();
    elements.requestMethod.style.background = getMethodColor(method);

    let url = `${API_BASE_URL}${resource.endpoint}`;
    if (operation === 'show' || operation === 'update' || operation === 'delete') {
        url += '/{id}';
    }
    elements.requestUrl.textContent = url;

    // Update params section
    updateParamsSection(operation);

    // Update body section
    updateBodySection(operation, resource);
}

function getMethodColor(method) {
    const colors = {
        GET: 'rgba(34, 197, 94, 0.3)',
        POST: 'rgba(59, 130, 246, 0.3)',
        PUT: 'rgba(245, 158, 11, 0.3)',
        PATCH: 'rgba(245, 158, 11, 0.3)',
        DELETE: 'rgba(239, 68, 68, 0.3)'
    };
    return colors[method] || 'rgba(99, 102, 241, 0.3)';
}

function updateParamsSection(operation) {
    elements.paramsContainer.innerHTML = '';

    if (operation === 'list') {
        // Add pagination params
        addParamRow('page', '1');
        addParamRow('per_page', '25');
    } else if (operation === 'show' || operation === 'update' || operation === 'delete') {
        // Add ID param
        addParamRow('id', '', true);
    }
}

function addParamRow(key, value = '', required = false) {
    const row = document.createElement('div');
    row.className = 'param-row';
    row.innerHTML = `
        <input type="text" placeholder="${getFieldLabel(key)}" value="${key}" class="param-key" ${required ? 'readonly' : ''}>
        <input type="text" placeholder="${t('resourceId')}" value="${value}" class="param-value">
        ${!required ? '<button class="remove-param" title="Remove">×</button>' : '<span></span>'}
    `;

    if (!required) {
        row.querySelector('.remove-param').addEventListener('click', () => row.remove());
    }

    elements.paramsContainer.appendChild(row);
}

// Map field names to their entity endpoints
function getEntityEndpoint(fieldName) {
    const fieldMap = {
        'category_id': { endpoint: '/product_categories', key: 'product_categories', nameField: 'name' },
        'product_category_id': { endpoint: '/product_categories', key: 'product_categories', nameField: 'name' },
        'unit_id': { endpoint: '/product_units', key: 'product_units', nameField: 'name' },
        'product_unit_type_id': { endpoint: '/product_unit_types', key: 'product_unit_types', nameField: 'name' },
        'account_id': { endpoint: '/accounts', key: 'accounts', nameField: 'name' },
        'sales_account_id': { endpoint: '/accounts', key: 'accounts', nameField: 'name' },
        'purchase_account_id': { endpoint: '/accounts', key: 'accounts', nameField: 'name' },
        'cogs_account_id': { endpoint: '/accounts', key: 'accounts', nameField: 'name' },
        'inventory_id': { endpoint: '/inventories', key: 'inventories', nameField: 'name' },
        'vendor_id': { endpoint: '/vendors', key: 'vendors', nameField: 'name' },
        'customer_id': { endpoint: '/customers', key: 'customers', nameField: 'name' },
        'product_id': { endpoint: '/products', key: 'products', nameField: 'name' },
        'parent_id': { endpoint: '/product_categories', key: 'product_categories', nameField: 'name' } // For product_categories
    };
    return fieldMap[fieldName] || null;
}

// Fetch required entities for a form
async function fetchRequiredEntities(fields, resource) {
    if (!state.apiKey) return;

    const entitiesToFetch = new Set();
    const entityMap = {};

    fields.forEach(field => {
        const entityInfo = getEntityEndpoint(field);
        if (entityInfo) {
            // Special handling for parent_id - use current resource if it's product_categories
            if (field === 'parent_id' && resource.endpoint === '/product_categories') {
                if (!state.cachedData.product_categories || state.cachedData.product_categories.length === 0) {
                    entitiesToFetch.add('/product_categories');
                    entityMap['/product_categories'] = { endpoint: '/product_categories', key: 'product_categories', nameField: 'name' };
                }
            } else if (!state.cachedData[entityInfo.key] || state.cachedData[entityInfo.key].length === 0) {
                entitiesToFetch.add(entityInfo.endpoint);
                entityMap[entityInfo.endpoint] = entityInfo;
            }
        }
    });

    if (entitiesToFetch.size === 0) return;

    showToast(t('loading') + '...', 'info');

    const fetchPromises = Array.from(entitiesToFetch).map(async endpoint => {
        const entityInfo = entityMap[endpoint];
        try {
            const url = `${API_BASE_URL}${endpoint}`;
            const response = await fetch(url, {
                headers: { 'API-KEY': state.apiKey }
            });
            
            if (response.ok) {
                const data = await response.json();
                const dataKey = entityInfo.key;
                // Handle different response formats
                if (data[dataKey] && Array.isArray(data[dataKey])) {
                    state.cachedData[dataKey] = data[dataKey];
                } else if (Array.isArray(data)) {
                    state.cachedData[dataKey] = data;
                } else if (data.data && Array.isArray(data.data)) {
                    state.cachedData[dataKey] = data.data;
                }
            }
        } catch (error) {
            console.error(`Failed to fetch ${endpoint}:`, error);
        }
    });

    await Promise.all(fetchPromises);
}

// Get available options for a field
function getFieldOptions(fieldName, resource) {
    const entityInfo = getEntityEndpoint(fieldName);
    if (!entityInfo) return null;

    const data = state.cachedData[entityInfo.key] || [];
    if (fieldName === 'parent_id' && resource.endpoint === '/product_categories') {
        return data.map(item => ({ id: item.id, name: item.name || item.name_ar || item.name_en || `ID: ${item.id}` }));
    }
    
    return data.map(item => ({ 
        id: item.id, 
        name: item.name || item.name_ar || item.name_en || item.code || `ID: ${item.id}` 
    }));
}

// Show entity options helper
function showEntityOptions(fields, resource) {
    const optionsContainer = document.getElementById('entity-options');
    if (!optionsContainer) return;

    const options = [];
    fields.forEach(field => {
        if (field.includes('_id')) {
            const fieldOptions = getFieldOptions(field, resource);
            if (fieldOptions && fieldOptions.length > 0) {
                const fieldLabel = FIELD_LABELS[state.currentLang][field] || field;
                options.push({
                    field,
                    label: fieldLabel,
                    options: fieldOptions
                });
            }
        }
    });

    if (options.length > 0) {
        let html = '<strong>📋 Available Options:</strong><br>';
        options.forEach(opt => {
            html += `<div style="margin-top: 8px;"><strong>${opt.label}:</strong> `;
            html += opt.options.map(o => `<span style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; margin: 0 4px;">${o.name} (${o.id})</span>`).join('');
            html += '</div>';
        });
        optionsContainer.innerHTML = html;
        optionsContainer.style.display = 'block';
    } else {
        optionsContainer.style.display = 'none';
    }
}

function updateBodySection(operation, resource) {
    if (operation === 'create' || operation === 'update') {
        elements.bodySection.classList.remove('hidden');

        const fields = resource.fields[operation] || resource.fields.create || [];
        
        // Fetch required entities asynchronously
        fetchRequiredEntities(fields, resource).then(() => {
            // Rebuild template with fetched data
            const bodyTemplate = {};
            const comments = {};

            fields.forEach(field => {
                if (field === 'line_items') {
                    bodyTemplate[field] = [
                        {
                            product_id: 1,
                            quantity: 1,
                            unit_price: 100
                        }
                    ];
                } else if (field.includes('price') || field === 'amount') {
                    bodyTemplate[field] = 0.00;
                } else if (field.includes('_id')) {
                    const options = getFieldOptions(field, resource);
                    if (options && options.length > 0) {
                        bodyTemplate[field] = options[0].id;
                        comments[field] = `// Available: ${options.map(o => `${o.name} (${o.id})`).join(', ')}`;
                    } else {
                        bodyTemplate[field] = 1;
                        comments[field] = `// Please fetch ${field.replace('_id', '')} first`;
                    }
                } else if (field === 'date' || field.includes('date')) {
                    bodyTemplate[field] = new Date().toISOString().split('T')[0];
                } else if (field === 'track_quantity') {
                    bodyTemplate[field] = true;
                } else {
                    bodyTemplate[field] = '';
                }
            });

            // Format JSON
            let jsonStr = formatJSON(bodyTemplate);
            elements.requestBody.value = jsonStr;

            // Show entity options in helper section
            showEntityOptions(fields, resource);
        });

        // Build initial template while fetching
        const bodyTemplate = {};

        fields.forEach(field => {
            if (field === 'line_items') {
                bodyTemplate[field] = [
                    {
                        product_id: 1,
                        quantity: 1,
                        unit_price: 100
                    }
                ];
            } else if (field.includes('price') || field === 'amount') {
                bodyTemplate[field] = 0.00;
            } else if (field.includes('_id')) {
                bodyTemplate[field] = 1;
            } else if (field === 'date' || field.includes('date')) {
                bodyTemplate[field] = new Date().toISOString().split('T')[0];
            } else if (field === 'track_quantity') {
                bodyTemplate[field] = true;
            } else {
                bodyTemplate[field] = '';
            }
        });

        elements.requestBody.value = formatJSON(bodyTemplate);
    } else {
        elements.bodySection.classList.add('hidden');
        elements.requestBody.value = '';
    }
}

function formatJsonBody() {
    try {
        const parsed = JSON.parse(elements.requestBody.value);
        elements.requestBody.value = formatJSON(parsed);
        showToast(t('success'), 'success');
    } catch (e) {
        showToast(t('error') + ': Invalid JSON', 'error');
    }
}

// ============================================
// API Request Handling
// ============================================
async function sendRequest() {
    if (!state.apiKey) {
        showToast(t('apiKeyRequired'), 'warning');
        return;
    }

    const resource = RESOURCES[state.currentResource];
    const operation = state.currentOperation;

    // Build URL
    let url = `${API_BASE_URL}${resource.endpoint}`;

    // Get params
    const params = {};
    let resourceId = null;

    elements.paramsContainer.querySelectorAll('.param-row').forEach(row => {
        const key = row.querySelector('.param-key').value;
        const value = row.querySelector('.param-value').value;
        if (key && value) {
            if (key === 'id') {
                resourceId = value;
            } else {
                params[key] = value;
            }
        }
    });

    // Validate ID for operations that need it
    if ((operation === 'show' || operation === 'update' || operation === 'delete') && !resourceId) {
        showToast(t('idRequired'), 'warning');
        return;
    }

    // Append ID to URL if needed
    if (resourceId) {
        url += `/${resourceId}`;
    }

    // Append query params
    const queryString = new URLSearchParams(params).toString();
    if (queryString) {
        url += `?${queryString}`;
    }

    // Prepare request options
    const options = {
        method: getMethod(operation),
        headers: {
            'API-KEY': state.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };

    // Add body for POST/PUT
    if (operation === 'create' || operation === 'update') {
        try {
            options.body = elements.requestBody.value;
            JSON.parse(options.body); // Validate JSON
        } catch (e) {
            showToast(t('error') + ': Invalid JSON body', 'error');
            return;
        }
    }

    showLoading();
    const startTime = performance.now();

    try {
        const response = await fetch(url, options);
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);

        state.responseHeaders = {};
        response.headers.forEach((value, key) => {
            state.responseHeaders[key] = value;
        });

        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        displayResponse(response.status, duration, data);

        if (response.ok) {
            showToast(t('success') + `: ${response.status}`, 'success');
        } else {
            showToast(t('error') + `: ${response.status}`, 'error');
        }

    } catch (error) {
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);

        displayResponse(0, duration, { error: error.message });
        showToast(t('error') + ': ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function getMethod(operation) {
    const methods = {
        list: 'GET',
        show: 'GET',
        create: 'POST',
        update: 'PUT',
        delete: 'DELETE'
    };
    return methods[operation];
}

function displayResponse(status, duration, data) {
    // Update status badge
    elements.responseStatus.textContent = status || 'Error';
    elements.responseStatus.className = 'status-badge';
    if (status >= 200 && status < 300) {
        elements.responseStatus.classList.add('success');
    } else if (status >= 400 || status === 0) {
        elements.responseStatus.classList.add('error');
    }

    // Update duration
    elements.responseTime.textContent = `${duration}ms`;

    // Update body content
    displayResponseBody(data);
}

function displayResponseBody(data) {
    if (typeof data === 'string') {
        elements.responseContent.innerHTML = `<pre>${data}</pre>`;
    } else {
        elements.responseContent.innerHTML = `<pre>${syntaxHighlight(data)}</pre>`;
    }
}

function displayResponseHeaders() {
    if (state.responseHeaders) {
        elements.responseContent.innerHTML = `<pre>${syntaxHighlight(state.responseHeaders)}</pre>`;
    } else {
        elements.responseContent.innerHTML = `<div class="empty-response"><span>📋</span><p>No headers available</p></div>`;
    }
}

function switchResponseTab(tab) {
    elements.responseTabs.forEach(t => {
        t.classList.toggle('active', t === tab);
    });

    if (tab.dataset.resp === 'headers') {
        displayResponseHeaders();
    } else {
        // Re-display the body (would need to store the last response)
    }
}

// ============================================
// Event Listeners
// ============================================
function initEventListeners() {
    // Language switch
    elements.langSwitch.addEventListener('click', toggleLanguage);

    // API key management
    elements.toggleKeyBtn.addEventListener('click', toggleApiKeyVisibility);
    elements.apiKeyInput.addEventListener('input', updateConnectionStatus);

    // Try to load API key from localStorage
    const savedApiKey = localStorage.getItem('qoyod_api_key');
    if (savedApiKey) {
        elements.apiKeyInput.value = savedApiKey;
        updateConnectionStatus();
    }

    // Save API key to localStorage on change
    elements.apiKeyInput.addEventListener('change', () => {
        localStorage.setItem('qoyod_api_key', elements.apiKeyInput.value);
        // Clear cached data when API key changes
        Object.keys(state.cachedData).forEach(key => state.cachedData[key] = []);
    });

    // Refresh entities button (if exists)
    const refreshBtn = document.getElementById('refresh-entities');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            if (!state.apiKey) {
                showToast(t('apiKeyRequired'), 'warning');
                return;
            }
            if (state.currentResource && ['create', 'update'].includes(state.currentOperation)) {
                const resource = RESOURCES[state.currentResource];
                const fields = resource.fields[state.currentOperation] || resource.fields.create || [];
                await fetchRequiredEntities(fields, resource);
                updateBodySection(state.currentOperation, resource);
                showToast(t('success') || 'Entities refreshed', 'success');
            }
        });
    }

    // Navigation items
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => {
            selectResource(item.dataset.resource);
        });
    });

    // Operation tabs
    elements.operationsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            selectOperation(tab.dataset.operation);
        });
    });

    // Format JSON button
    elements.formatJsonBtn.addEventListener('click', formatJsonBody);

    // Send request button
    elements.sendRequestBtn.addEventListener('click', sendRequest);

    // Response tabs
    elements.responseTabs.forEach(tab => {
        tab.addEventListener('click', () => switchResponseTab(tab));
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to send request
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (state.currentResource) {
                sendRequest();
            }
        }
    });
}

// ============================================
// Initialization
// ============================================
function init() {
    console.log('🚀 Qoyod API Tester initialized');
    initEventListeners();
    updateUILabels();
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
