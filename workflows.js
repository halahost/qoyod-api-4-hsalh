/**
 * Qoyod Workflow Simulator
 * Comprehensive workflow simulations for e-commerce integration
 */

// ============================================
// Configuration
// ============================================
// Detect if running on localhost (via proxy server)
const IS_LOCALHOST = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.');

// Use proxy when running via server.js, direct API otherwise
const DEFAULT_API_BASE = IS_LOCALHOST ? '/api' : 'https://api.qoyod.com/2.0';
const API_BASE_URL = DEFAULT_API_BASE;

// ============================================
// Workflow Definitions
// ============================================
const WORKFLOWS = {
    'product-setup': {
        id: 'product-setup',
        nameAr: 'إعداد المنتجات',
        nameEn: 'Product Setup',
        descAr: 'إنشاء وربط المنتجات بين المتجر الإلكتروني وقيود',
        descEn: 'Create and sync products between e-commerce store and Qoyod',
        scenarios: [
            { id: 'tracked', nameAr: 'منتج بمخزون', nameEn: 'Tracked Inventory' },
            { id: 'untracked', nameAr: 'خدمة/دروب شوبينج', nameEn: 'Service/Dropshipping' }
        ],
        steps: [
            {
                id: 1,
                nameAr: 'جلب التصنيفات',
                nameEn: 'Fetch Categories',
                method: 'GET',
                endpoint: '/categories',
                descAr: 'جلب قائمة تصنيفات المنتجات المتاحة',
                descEn: 'Fetch available product categories'
            },
            {
                id: 2,
                nameAr: 'جلب وحدات القياس',
                nameEn: 'Fetch Units',
                method: 'GET',
                endpoint: '/product_unit_types',
                descAr: 'جلب وحدات القياس المتاحة',
                descEn: 'Fetch available measurement units'
            },
            {
                id: 3,
                nameAr: 'جلب المخازن',
                nameEn: 'Fetch Inventories',
                method: 'GET',
                endpoint: '/inventories',
                descAr: 'جلب قائمة المخازن المتاحة (للمنتجات المتتبعة)',
                descEn: 'Fetch available inventories (for tracked products)',
                condition: 'tracked'
            },
            {
                id: 4,
                nameAr: 'إنشاء المنتج',
                nameEn: 'Create Product',
                method: 'POST',
                endpoint: '/products',
                descAr: 'إنشاء المنتج في قيود',
                descEn: 'Create product in Qoyod',
                body: {
                    product: {
                        sku: 'PROD-001',
                        name_ar: 'اسم المنتج',
                        name_en: 'Product Name',
                        product_unit_type_id: 1,
                        category_id: 1,
                        tax_id: 1,
                        sale_item: 1,
                        selling_price: 100,
                        sales_account_id: null,
                        purchase_item: 1,
                        buying_price: 50,
                        purchase_account_id: null,
                        cogs_account_id: null,
                        track_quantity: true,
                        description: ''
                    }
                },
                formFields: [
                    { name: 'sku', labelAr: 'رمز المنتج (SKU)', labelEn: 'SKU (Unique)', type: 'text', required: true },
                    { name: 'name_ar', labelAr: 'اسم المنتج (عربي)', labelEn: 'Product Name (Arabic)', type: 'text', required: true },
                    { name: 'name_en', labelAr: 'اسم المنتج (إنجليزي)', labelEn: 'Product Name (English)', type: 'text', required: true },
                    { name: 'product_unit_type_id', labelAr: 'الوحدة', labelEn: 'Unit', type: 'select', options: 'units', required: true },
                    { name: 'category_id', labelAr: 'التصنيف', labelEn: 'Category', type: 'select', options: 'categories', required: true },
                    { name: 'tax_id', labelAr: 'الضريبة', labelEn: 'Tax', type: 'select', options: 'taxes', required: true },
                    { name: 'sales_account_id', labelAr: 'حساب المبيعات', labelEn: 'Sales Account', type: 'select', options: 'accounts', required: true },
                    { name: 'purchase_account_id', labelAr: 'حساب المشتريات', labelEn: 'Purchase Account', type: 'select', options: 'accounts', required: true },
                    { name: 'cogs_account_id', labelAr: 'حساب التكلفة', labelEn: 'COGS Account', type: 'select', options: 'accounts', required: true },
                    { name: 'selling_price', labelAr: 'سعر البيع', labelEn: 'Selling Price', type: 'number', required: true },
                    { name: 'buying_price', labelAr: 'سعر الشراء', labelEn: 'Buying Price', type: 'number', required: true },
                    { name: 'track_quantity', labelAr: 'تتبع المخزون', labelEn: 'Track Inventory', type: 'checkbox' },
                    { name: 'description', labelAr: 'الوصف', labelEn: 'Description', type: 'textarea' }
                ]
            }
        ]
    },
    'order-processing': {
        id: 'order-processing',
        nameAr: 'معالجة الطلبات',
        nameEn: 'Order Processing',
        descAr: 'معالجة طلب جديد من المتجر وإنشاء الفاتورة',
        descEn: 'Process new order from store and create invoice',
        scenarios: [
            { id: 'existing-customer', nameAr: 'عميل موجود', nameEn: 'Existing Customer' },
            { id: 'new-customer', nameAr: 'عميل جديد', nameEn: 'New Customer' },
            { id: 'cash-customer', nameAr: 'عميل نقدي', nameEn: 'Cash Customer' }
        ],
        steps: [
            {
                id: 1,
                nameAr: 'البحث عن العميل',
                nameEn: 'Search Customer',
                method: 'GET',
                endpoint: '/customers',
                descAr: 'البحث عن العميل بالبريد الإلكتروني',
                descEn: 'Search for customer by email',
                queryParams: { 'q[email_eq]': '' }
            },
            {
                id: 2,
                nameAr: 'إنشاء عميل جديد',
                nameEn: 'Create Customer',
                method: 'POST',
                endpoint: '/customers',
                descAr: 'إنشاء عميل جديد (إذا لم يكن موجوداً)',
                descEn: 'Create new customer (if not exists)',
                condition: 'new-customer',
                body: {
                    contact: {
                        name: 'اسم العميل',
                        email: 'customer@example.com',
                        phone: '0501234567',
                        vat_number: '',
                        address: '',
                        city: 'الرياض',
                        country: 'SA'
                    }
                },
                formFields: [
                    { name: 'name', labelAr: 'اسم العميل', labelEn: 'Customer Name', type: 'text', required: true },
                    { name: 'email', labelAr: 'البريد الإلكتروني', labelEn: 'Email', type: 'email' },
                    { name: 'phone', labelAr: 'رقم الهاتف', labelEn: 'Phone', type: 'tel' },
                    { name: 'vat_number', labelAr: 'الرقم الضريبي', labelEn: 'VAT Number', type: 'text', hintAr: 'مطلوب للفاتورة الضريبية B2B', hintEn: 'Required for B2B tax invoice' },
                    { name: 'address', labelAr: 'العنوان', labelEn: 'Address', type: 'text' },
                    { name: 'city', labelAr: 'المدينة', labelEn: 'City', type: 'text' }
                ]
            },
            {
                id: 3,
                nameAr: 'جلب قائمة المنتجات',
                nameEn: 'Fetch All Products',
                method: 'GET',
                endpoint: '/products?limit=100',
                descAr: 'جلب جميع المنتجات المتاحة لاستخدامها في الفواتير',
                descEn: 'Fetch all available products for use in invoices'
            },
            {
                id: 4,
                nameAr: 'إنشاء الفاتورة',
                nameEn: 'Create Invoice',
                method: 'POST',
                endpoint: '/invoices',
                descAr: 'إنشاء فاتورة المبيعات',
                descEn: 'Create sales invoice',
                body: {
                    invoice: {
                        contact_id: 1,
                        issue_date: new Date().toISOString().split('T')[0],
                        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        status: 'Approved',
                        inventory_id: 1,
                        reference: 'ORD-001',
                        description: 'طلب من المتجر الإلكتروني',
                        line_items: [
                            {
                                product_id: 1,
                                quantity: 1,
                                unit_price: 100
                            }
                        ]
                    }
                },
                formFields: [
                    { name: 'contact_id', labelAr: 'العميل', labelEn: 'Customer', type: 'select', options: 'customers', required: true },
                    { name: 'issue_date', labelAr: 'تاريخ الإصدار', labelEn: 'Issue Date', type: 'date', required: true },
                    { name: 'due_date', labelAr: 'تاريخ الاستحقاق', labelEn: 'Due Date', type: 'date', required: true },
                    { name: 'status', labelAr: 'الحالة', labelEn: 'Status', type: 'select', options: 'statuses', required: true },
                    { name: 'inventory_id', labelAr: 'المخزن', labelEn: 'Inventory', type: 'select', options: 'inventories', required: true },
                    { name: 'reference', labelAr: 'رقم المرجع', labelEn: 'Reference', type: 'text' },
                    { name: 'line_items', labelAr: 'بنود الفاتورة', labelEn: 'Line Items', type: 'line_items' }
                ]
            }
        ]
    },
    'invoice-creation': {
        id: 'invoice-creation',
        nameAr: 'إصدار الفواتير',
        nameEn: 'Invoice Creation',
        descAr: 'إصدار فواتير متوافقة مع هيئة الزكاة والدخل',
        descEn: 'Create ZATCA-compliant invoices',
        scenarios: [
            { id: 'standard', nameAr: 'فاتورة ضريبية (B2B)', nameEn: 'Standard Tax Invoice (B2B)', icon: '🏢' },
            { id: 'simplified', nameAr: 'فاتورة مبسطة (B2C)', nameEn: 'Simplified Invoice (B2C)', icon: '🛒' }
        ],
        infoBox: {
            type: 'note',
            titleAr: 'متطلبات ZATCA',
            titleEn: 'ZATCA Requirements',
            textAr: 'قيود يدعم الفوترة الإلكترونية المرحلة الثانية. يتم إنشاء رمز QR والختم التشفيري تلقائياً.',
            textEn: 'Qoyod supports Phase 2 e-invoicing. QR code and cryptographic stamp are generated automatically.'
        },
        steps: [
            {
                id: 1,
                nameAr: 'جلب العملاء والمخازن',
                nameEn: 'Fetch Customers & Inventories',
                method: 'GET',
                endpoint: '/customers',
                descAr: 'جلب قائمة العملاء والمخازن المتاحة',
                descEn: 'Fetch available customers and inventories'
            },
            {
                id: 2,
                nameAr: 'إنشاء الفاتورة',
                nameEn: 'Create Invoice',
                method: 'POST',
                endpoint: '/invoices',
                descAr: 'إنشاء الفاتورة مع البنود',
                descEn: 'Create invoice with line items',
                body: {
                    invoice: {
                        contact_id: 1,
                        issue_date: new Date().toISOString().split('T')[0],
                        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        status: 'Approved',
                        inventory_id: 1,
                        reference: 'INV-001',
                        description: '',
                        line_items: [
                            {
                                product_id: 1,
                                quantity: 1,
                                unit_price: 100
                            }
                        ]
                    }
                },
                formFields: [
                    { name: 'contact_id', labelAr: 'العميل', labelEn: 'Customer', type: 'select', options: 'customers', required: true },
                    { name: 'issue_date', labelAr: 'تاريخ الإصدار', labelEn: 'Issue Date', type: 'date', required: true },
                    { name: 'due_date', labelAr: 'تاريخ الاستحقاق', labelEn: 'Due Date', type: 'date', required: true },
                    { name: 'status', labelAr: 'الحالة', labelEn: 'Status', type: 'select', options: 'statuses', required: true, hintAr: 'Draft أو Approved', hintEn: 'Draft or Approved' },
                    { name: 'inventory_id', labelAr: 'المخزن', labelEn: 'Inventory', type: 'select', options: 'inventories', required: true },
                    { name: 'reference', labelAr: 'رقم المرجع', labelEn: 'Reference', type: 'text', hintAr: 'رقم الطلب من المتجر', hintEn: 'Order number from store' },
                    { name: 'line_items', labelAr: 'بنود الفاتورة', labelEn: 'Line Items', type: 'line_items' }
                ]
            }
        ]
    },
    'payment-processing': {
        id: 'payment-processing',
        nameAr: 'تحصيل المدفوعات',
        nameEn: 'Payment Processing',
        descAr: 'تسجيل المدفوعات على الفواتير',
        descEn: 'Record payments on invoices',
        scenarios: [
            { id: 'full', nameAr: 'سداد كامل', nameEn: 'Full Payment' },
            { id: 'partial', nameAr: 'سداد جزئي', nameEn: 'Partial Payment' }
        ],
        steps: [
            {
                id: 1,
                nameAr: 'جلب الفواتير غير المسددة',
                nameEn: 'Get Unpaid Invoices',
                method: 'GET',
                endpoint: '/invoices',
                descAr: 'جلب الفواتير التي لم يتم سدادها بالكامل',
                descEn: 'Get invoices not fully paid',
                queryParams: { 'q[status_eq]': 'unpaid' }
            },
            {
                id: 2,
                nameAr: 'جلب الحسابات',
                nameEn: 'Get Accounts',
                method: 'GET',
                endpoint: '/accounts',
                descAr: 'جلب حسابات البنك والصندوق',
                descEn: 'Get bank and cash accounts'
            },
            {
                id: 3,
                nameAr: 'تسجيل الدفعة',
                nameEn: 'Record Payment',
                method: 'POST',
                endpoint: '/invoice_payments',
                descAr: 'تسجيل الدفعة على الفاتورة',
                descEn: 'Record payment on invoice',
                body: {
                    invoice_payment: {
                        reference: 'PAY-001',
                        invoice_id: 1,
                        account_id: 1,
                        date: new Date().toISOString().split('T')[0],
                        amount: 100
                    }
                },
                formFields: [
                    { name: 'reference', labelAr: 'رقم المرجع', labelEn: 'Reference (Unique)', type: 'text', required: true },
                    { name: 'invoice_id', labelAr: 'الفاتورة', labelEn: 'Invoice', type: 'select', options: 'invoices', required: true },
                    { name: 'account_id', labelAr: 'الحساب', labelEn: 'Account', type: 'select', options: 'accounts', required: true },
                    { name: 'date', labelAr: 'تاريخ الدفع', labelEn: 'Payment Date', type: 'date', required: true },
                    { name: 'amount', labelAr: 'المبلغ', labelEn: 'Amount', type: 'number', required: true }
                ]
            }
        ]
    },
    'purchase-restock': {
        id: 'purchase-restock',
        nameAr: 'أوامر الشراء',
        nameEn: 'Purchase & Restock',
        descAr: 'إنشاء أوامر شراء وإعادة التخزين',
        descEn: 'Create purchase orders and restock inventory',
        steps: [
            {
                id: 1,
                nameAr: 'جلب الموردين',
                nameEn: 'Get Vendors',
                method: 'GET',
                endpoint: '/vendors',
                descAr: 'جلب قائمة الموردين',
                descEn: 'Get list of vendors'
            },
            {
                id: 11,
                nameAr: 'جلب المنتجات',
                nameEn: 'Fetch Products',
                method: 'GET',
                endpoint: '/products?limit=100',
                descAr: 'جلب المنتجات المتاحة',
                descEn: 'Fetch available products'
            },
            {
                id: 2,
                nameAr: 'إنشاء أمر شراء',
                nameEn: 'Create Purchase Order',
                method: 'POST',
                endpoint: '/orders',
                descAr: 'إنشاء أمر شراء للمورد',
                descEn: 'Create purchase order for vendor',
                body: {
                    order: {
                        contact_id: 1,
                        issue_date: new Date().toISOString().split('T')[0],
                        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        status: 'Draft',
                        inventory_id: 1,
                        reference: 'PO-001',
                        description: '',
                        line_items: [
                            {
                                product_id: 1,
                                quantity: 10,
                                unit_price: 50,
                                inventory_id: 1,
                                tax_percent: 15,
                                discount: 0,
                                discount_type: 'percentage',
                                description: 'Product Description'
                            }
                        ]
                    }
                },
                formFields: [
                    { name: 'contact_id', labelAr: 'المورد', labelEn: 'Vendor', type: 'select', options: 'vendors', required: true },
                    { name: 'inventory_id', labelAr: 'المخزن', labelEn: 'Inventory', type: 'select', options: 'inventories', required: true },
                    { name: 'issue_date', labelAr: 'تاريخ الإصدار', labelEn: 'Issue Date', type: 'date', required: true },
                    { name: 'expiry_date', labelAr: 'تاريخ الانتهاء', labelEn: 'Expiry Date', type: 'date', required: true },
                    { name: 'status', labelAr: 'الحالة', labelEn: 'Status', type: 'select', options: 'statuses', required: true },
                    { name: 'reference', labelAr: 'رقم المرجع', labelEn: 'Reference', type: 'text' },
                    { name: 'line_items', labelAr: 'بنود الشراء', labelEn: 'Line Items', type: 'line_items' }
                ]
            },
            {
                id: 3,
                nameAr: 'إنشاء فاتورة المشتريات',
                nameEn: 'Create Bill',
                method: 'POST',
                endpoint: '/bills',
                descAr: 'إنشاء فاتورة عند استلام البضاعة',
                descEn: 'Create bill when goods received',
                body: {
                    bill: {
                        contact_id: 1,
                        status: 'Approved',
                        issue_date: new Date().toISOString().split('T')[0],
                        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        inventory_id: 1,
                        reference: 'BILL-001',
                        line_items: [
                            {
                                product_id: 1,
                                quantity: 10,
                                unit_price: 50
                            }
                        ]
                    }
                },
                formFields: [
                    { name: 'contact_id', labelAr: 'المورد', labelEn: 'Vendor', type: 'select', options: 'vendors', required: true },
                    { name: 'status', labelAr: 'الحالة', labelEn: 'Status', type: 'select', options: 'statuses', required: true },
                    { name: 'issue_date', labelAr: 'تاريخ الإصدار', labelEn: 'Issue Date', type: 'date', required: true },
                    { name: 'due_date', labelAr: 'تاريخ الاستحقاق', labelEn: 'Due Date', type: 'date', required: true },
                    { name: 'inventory_id', labelAr: 'المخزن', labelEn: 'Inventory', type: 'select', options: 'inventories', required: true },
                    { name: 'line_items', labelAr: 'بنود الفاتورة', labelEn: 'Line Items', type: 'line_items' }
                ]
            },
            {
                id: 4,
                nameAr: 'سداد الفاتورة',
                nameEn: 'Pay Bill',
                method: 'POST',
                endpoint: '/bill_payments',
                descAr: 'تسجيل سداد الفاتورة للمورد',
                descEn: 'Record bill payment to vendor',
                body: {
                    bill_payment: {
                        reference: 'BPAY-001',
                        bill_id: 1,
                        account_id: 1,
                        date: new Date().toISOString().split('T')[0],
                        amount: 500
                    }
                },
                formFields: [
                    { name: 'reference', labelAr: 'رقم المرجع', labelEn: 'Reference (Unique)', type: 'text', required: true },
                    { name: 'bill_id', labelAr: 'الفاتورة', labelEn: 'Bill', type: 'select', options: 'bills', required: true },
                    { name: 'account_id', labelAr: 'الحساب', labelEn: 'Account', type: 'select', options: 'accounts', required: true },
                    { name: 'date', labelAr: 'تاريخ الدفع', labelEn: 'Payment Date', type: 'date', required: true },
                    { name: 'amount', labelAr: 'المبلغ', labelEn: 'Amount', type: 'number', required: true }
                ]
            }
        ]
    },
    'dropshipping': {
        id: 'dropshipping',
        nameAr: 'دروب شوبينج',
        nameEn: 'Dropshipping',
        descAr: 'معالجة طلبات الدروب شوبينج بدون تتبع المخزون',
        descEn: 'Process dropshipping orders without inventory tracking',
        infoBox: {
            type: 'note',
            titleAr: 'ملاحظة مهمة',
            titleEn: 'Important Note',
            textAr: 'في الدروب شوبينج، المنتجات تُنشأ بدون تتبع المخزون (track_quantity: false). يتم تسجيل تكلفة المورد كفاتورة مبسطة.',
            textEn: 'In dropshipping, products are created without inventory tracking (track_quantity: false). Supplier cost is recorded as simple bill.'
        },
        steps: [
            {
                id: 1,
                nameAr: 'إنشاء فاتورة المبيعات',
                nameEn: 'Create Sales Invoice',
                method: 'POST',
                endpoint: '/invoices',
                descAr: 'إنشاء فاتورة للعميل (بدون التحقق من المخزون)',
                descEn: 'Create customer invoice (no inventory check)',
                body: {
                    invoice: {
                        contact_id: 1,
                        issue_date: new Date().toISOString().split('T')[0],
                        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        status: 'Approved',
                        inventory_id: 1,
                        reference: 'DS-ORD-001',
                        description: 'طلب دروب شوبينج',
                        line_items: [
                            {
                                product_id: 1,
                                quantity: 1,
                                unit_price: 150
                            }
                        ]
                    }
                },
                formFields: [
                    { name: 'contact_id', labelAr: 'العميل', labelEn: 'Customer', type: 'select', options: 'customers', required: true },
                    { name: 'issue_date', labelAr: 'تاريخ الإصدار', labelEn: 'Issue Date', type: 'date', required: true },
                    { name: 'due_date', labelAr: 'تاريخ الاستحقاق', labelEn: 'Due Date', type: 'date', required: true },
                    { name: 'status', labelAr: 'الحالة', labelEn: 'Status', type: 'select', options: 'statuses', required: true },
                    { name: 'inventory_id', labelAr: 'المخزن', labelEn: 'Inventory', type: 'select', options: 'inventories', required: true },
                    { name: 'reference', labelAr: 'رقم الطلب', labelEn: 'Order Number', type: 'text' },
                    { name: 'line_items', labelAr: 'بنود الفاتورة', labelEn: 'Line Items', type: 'line_items' }
                ]
            },
            {
                id: 2,
                nameAr: 'تسجيل تكلفة المورد',
                nameEn: 'Record Supplier Cost',
                method: 'POST',
                endpoint: '/simple_bills',
                descAr: 'تسجيل تكلفة البضاعة المباعة كفاتورة مبسطة',
                descEn: 'Record COGS as simple bill',
                body: {
                    simple_bill: {
                        contact_id: 1,
                        status: 'Approved',
                        issue_date: new Date().toISOString().split('T')[0],
                        inventory_id: 1,
                        reference: 'DS-COST-001',
                        simple_bill_items_attributes: [
                            {
                                expense_category_id: 1,
                                total_amount: 100,
                                tax_id: 1
                            }
                        ]
                    }
                },
                formFields: [
                    { name: 'contact_id', labelAr: 'المورد', labelEn: 'Vendor', type: 'select', options: 'vendors', required: true },
                    { name: 'status', labelAr: 'الحالة', labelEn: 'Status', type: 'select', options: 'statuses', required: true },
                    { name: 'issue_date', labelAr: 'التاريخ', labelEn: 'Date', type: 'date', required: true },
                    { name: 'inventory_id', labelAr: 'المخزن', labelEn: 'Inventory', type: 'select', options: 'inventories', required: true },
                    { name: 'reference', labelAr: 'رقم طلب المورد', labelEn: 'Supplier Order #', type: 'text' },
                    { name: 'expense_category_id', labelAr: 'حساب المصروفات', labelEn: 'Expense Account', type: 'select', options: 'accounts', required: true },
                    { name: 'total_amount', labelAr: 'تكلفة المورد', labelEn: 'Supplier Cost', type: 'number', required: true }
                ]
            },
            {
                id: 3,
                nameAr: 'تسجيل دفعة العميل',
                nameEn: 'Record Customer Payment',
                method: 'POST',
                endpoint: '/invoice_payments',
                descAr: 'تسجيل استلام الدفعة من العميل',
                descEn: 'Record payment received from customer',
                body: {
                    invoice_payment: {
                        reference: 'DS-PAY-001',
                        invoice_id: 1,
                        account_id: 1,
                        date: new Date().toISOString().split('T')[0],
                        amount: 150
                    }
                },
                formFields: [
                    { name: 'reference', labelAr: 'رقم المرجع', labelEn: 'Reference (Unique)', type: 'text', required: true },
                    { name: 'invoice_id', labelAr: 'الفاتورة', labelEn: 'Invoice', type: 'select', options: 'invoices', required: true },
                    { name: 'account_id', labelAr: 'الحساب', labelEn: 'Account', type: 'select', options: 'accounts', required: true },
                    { name: 'date', labelAr: 'تاريخ الدفع', labelEn: 'Payment Date', type: 'date', required: true },
                    { name: 'amount', labelAr: 'المبلغ', labelEn: 'Amount', type: 'number', required: true }
                ]
            },
            {
                id: 4,
                nameAr: 'سداد المورد',
                nameEn: 'Pay Supplier',
                method: 'POST',
                endpoint: '/simple_bill_payments',
                descAr: 'سداد تكلفة المورد',
                descEn: 'Pay supplier cost',
                body: {
                    simple_bill_payment: {
                        reference: 'DS-SPAY-001',
                        simple_bill_id: 1,
                        account_id: 1,
                        date: new Date().toISOString().split('T')[0],
                        amount: 100
                    }
                },
                formFields: [
                    { name: 'reference', labelAr: 'رقم المرجع', labelEn: 'Reference (Unique)', type: 'text', required: true },
                    { name: 'simple_bill_id', labelAr: 'الفاتورة المبسطة', labelEn: 'Simple Bill', type: 'select', options: 'simple_bills', required: true },
                    { name: 'account_id', labelAr: 'الحساب', labelEn: 'Account', type: 'select', options: 'accounts', required: true },
                    { name: 'date', labelAr: 'تاريخ الدفع', labelEn: 'Payment Date', type: 'date', required: true },
                    { name: 'amount', labelAr: 'المبلغ', labelEn: 'Amount', type: 'number', required: true }
                ]
            }
        ]
    }
};

// ============================================
// Translations
// ============================================
const UI_TEXT = {
    ar: {
        workflowSimulator: 'محاكاة سير العمل',
        apiTester: 'اختبار API',
        workflows: 'سير العمل',
        apiKey: 'مفتاح API',
        enterApiKey: 'أدخل مفتاح API الخاص بك',
        connected: 'متصل',
        notConnected: 'غير متصل',
        availableWorkflows: 'سير العمل المتاحة',
        reset: 'إعادة تعيين',
        runAll: 'تشغيل الكل',
        request: 'الطلب',
        response: 'الاستجابة',
        curl: 'cURL',
        executeStep: 'تنفيذ الخطوة الحالية',
        copy: 'نسخ',
        copied: 'تم النسخ!',
        noRequestYet: '// لم يتم إرسال طلب بعد',
        executing: 'جاري التنفيذ...',
        success: 'نجاح',
        error: 'خطأ',
        refreshData: 'تحديث البيانات',
        loading: 'جاري تحميل البيانات...',
        selectScenario: 'اختر السيناريو:',
        apiKeyRequired: 'الرجاء إدخال مفتاح API',
        addItem: '+ إضافة بند',
        product: 'المنتج',
        quantity: 'الكمية',
        unitPrice: 'سعر الوحدة',
        apiBaseUrl: 'رابط API الأساسي'
    },
    en: {
        workflowSimulator: 'Workflow Simulator',
        apiTester: 'API Tester',
        workflows: 'Workflows',
        apiKey: 'API Key',
        enterApiKey: 'Enter your API key',
        connected: 'Connected',
        enterApiKey: 'Enter your API key',
        connected: 'Connected',
        notConnected: 'Not connected',
        refreshData: 'Refresh Data',
        loading: 'Loading data...',
        availableWorkflows: 'Available Workflows',
        reset: 'Reset',
        runAll: 'Run All',
        request: 'Request',
        response: 'Response',
        curl: 'cURL',
        executeStep: 'Execute Current Step',
        copy: 'Copy',
        copied: 'Copied!',
        noRequestYet: '// No request sent yet',
        executing: 'Executing...',
        success: 'Success',
        error: 'Error',
        selectScenario: 'Select Scenario:',
        apiKeyRequired: 'Please enter API key',
        addItem: '+ Add Item',
        product: 'Product',
        quantity: 'Quantity',
        unitPrice: 'Unit Price',
        apiBaseUrl: 'API Base URL'
    }
};

// ============================================
// State
// ============================================
let state = {
    currentLang: 'ar',
    currentWorkflow: 'product-setup',
    currentStep: 0,
    currentScenario: null,
    currentView: 'postman', // 'postman' or 'ui'
    apiKey: '',
    apiBaseUrl: DEFAULT_API_BASE,
    stepResults: {},
    cachedData: {
        categories: [],
        units: [],
        inventories: [],
        customers: [],
        vendors: [],
        accounts: [],
        invoices: [],
        products: [],
        taxes: [
            { id: 1, name: '15% VAT', name_ar: '15% ضريبة القيمة المضافة' },
            { id: 2, name: '0% VAT', name_ar: '0% ضريبة القيمة المضافة' },
            { id: 3, name: 'Tax Exempt', name_ar: 'معفى من الضريبة' }
        ],
        statuses: [
            { id: 'Draft', name: 'Draft', name_ar: 'مسودة' },
            { id: 'Approved', name: 'Approved', name_ar: 'معتمد' }
        ]
    }
};

// ============================================
// DOM Elements
// ============================================
const elements = {};

function initElements() {
    elements.langSwitch = document.getElementById('lang-switch');
    elements.refreshBtn = document.getElementById('btn-refresh-data');
    elements.apiKeyInput = document.getElementById('api-key');
    elements.apiBaseUrlInput = document.getElementById('api-base-url');
    elements.toggleKeyBtn = document.getElementById('toggle-key');
    elements.connectionStatus = document.getElementById('connection-status');
    elements.workflowTitle = document.getElementById('workflow-title');
    elements.workflowDescription = document.getElementById('workflow-description');
    elements.workflowSteps = document.getElementById('workflow-steps');
    elements.workflowItems = document.querySelectorAll('.workflow-item');
    elements.resetBtn = document.getElementById('reset-workflow');
    elements.runAllBtn = document.getElementById('run-all');
    elements.executeStepBtn = document.getElementById('execute-step');
    elements.panelTabs = document.querySelectorAll('.panel-tab');
    elements.currentMethod = document.getElementById('current-method');
    elements.currentEndpoint = document.getElementById('current-endpoint');
    elements.requestHeaders = document.getElementById('request-headers');
    elements.requestBody = document.getElementById('request-body');
    elements.responseStatus = document.getElementById('response-status');
    elements.responseTime = document.getElementById('response-time');
    elements.responseBody = document.getElementById('response-body');
    elements.curlCommand = document.getElementById('curl-command');
    elements.copyCurlBtn = document.getElementById('copy-curl');
    elements.postmanView = document.getElementById('postman-view');
    elements.uiFormView = document.getElementById('ui-form-view');
    elements.workflowForm = document.getElementById('workflow-form');
    elements.viewPostmanBtn = document.getElementById('view-postman');
    elements.viewUiBtn = document.getElementById('view-ui');
    elements.toastContainer = document.getElementById('toast-container');
    elements.loadingOverlay = document.getElementById('loading-overlay');
}

// ============================================
// Utility Functions
// ============================================
function t(key) {
    return UI_TEXT[state.currentLang][key] || key;
}

function showToast(message, type = 'info') {
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-message">${message}</span>`;
    elements.toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
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
    if (typeof json !== 'string') json = JSON.stringify(json, null, 2);
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'json-number';
        if (/^"/.test(match)) {
            cls = /:$/.test(match) ? 'json-key' : 'json-string';
        } else if (/true|false/.test(match)) {
            cls = 'json-boolean';
        } else if (/null/.test(match)) {
            cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
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
    renderWorkflow();
    updateUILabels();
}

function updateUILabels() {
    document.querySelector('.logo h1').textContent = t('workflowSimulator');
    document.querySelector('.header-nav a:first-child').textContent = t('apiTester');
    document.querySelector('.header-nav a:last-child').textContent = t('workflows');
    document.querySelector('.api-key-section label').textContent = t('apiKey');
    document.querySelector('label[for="api-base-url"]').textContent = t('apiBaseUrl');
    elements.apiKeyInput.placeholder = t('enterApiKey');
    document.querySelector('.menu-title').textContent = t('availableWorkflows');
    elements.resetBtn.querySelector('span:last-child') && (elements.resetBtn.innerHTML = '<span>🔄</span> ' + t('reset'));
    elements.runAllBtn.innerHTML = '<span>▶️</span> ' + t('runAll');
    elements.executeStepBtn.innerHTML = '<span>🚀</span> ' + t('executeStep');
    elements.copyCurlBtn.innerHTML = '<span>📋</span> ' + t('copy');

    // Update panel tabs
    document.querySelectorAll('.panel-tab').forEach((tab, i) => {
        const keys = ['request', 'response', 'curl'];
        tab.textContent = t(keys[i]);
    });

    // Update workflow menu items
    elements.workflowItems.forEach(item => {
        const workflowId = item.dataset.workflow;
        const workflow = WORKFLOWS[workflowId];
        if (workflow) {
            item.querySelector('.workflow-name').textContent = state.currentLang === 'ar' ? workflow.nameAr : workflow.nameEn;
            item.querySelector('.workflow-desc').textContent = state.currentLang === 'ar' ? workflow.descAr : workflow.descEn;
        }
    });
}

// ============================================
// API Key Management
// ============================================
function toggleApiKeyVisibility() {
    elements.apiKeyInput.type = elements.apiKeyInput.type === 'password' ? 'text' : 'password';
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
// Workflow Rendering
// ============================================
function selectWorkflow(workflowId) {
    state.currentWorkflow = workflowId;
    state.currentStep = 0;
    state.stepResults = {};

    elements.workflowItems.forEach(item => {
        item.classList.toggle('active', item.dataset.workflow === workflowId);
    });

    renderWorkflow();
}

function renderWorkflow() {
    const workflow = WORKFLOWS[state.currentWorkflow];
    if (!workflow) return;

    // Update header
    elements.workflowTitle.textContent = state.currentLang === 'ar' ? workflow.nameAr : workflow.nameEn;
    elements.workflowDescription.textContent = state.currentLang === 'ar' ? workflow.descAr : workflow.descEn;

    // Render steps
    let stepsHtml = '';

    // Add info box if exists
    if (workflow.infoBox) {
        const info = workflow.infoBox;
        stepsHtml += `
            <div class="info-box ${info.type}">
                <span class="info-box-icon">${info.type === 'note' ? 'ℹ️' : info.type === 'warning' ? '⚠️' : '✅'}</span>
                <div class="info-box-content">
                    <div class="info-box-title">${state.currentLang === 'ar' ? info.titleAr : info.titleEn}</div>
                    <div class="info-box-text">${state.currentLang === 'ar' ? info.textAr : info.textEn}</div>
                </div>
            </div>
        `;
    }

    // Add scenario selector if exists
    if (workflow.scenarios) {
        stepsHtml += `<div class="scenario-selector">`;
        workflow.scenarios.forEach((scenario, i) => {
            const isActive = state.currentScenario === scenario.id || (!state.currentScenario && i === 0);
            if (isActive && !state.currentScenario) state.currentScenario = scenario.id;
            stepsHtml += `
                <button class="scenario-btn ${isActive ? 'active' : ''}" data-scenario="${scenario.id}">
                    ${scenario.icon || ''}
                    ${state.currentLang === 'ar' ? scenario.nameAr : scenario.nameEn}
                </button>
            `;
        });
        stepsHtml += `</div>`;
    }

    // Add steps
    workflow.steps.forEach((step, index) => {
        // Check if step should be shown based on scenario
        if (step.condition && step.condition !== state.currentScenario) {
            return;
        }

        const status = state.stepResults[step.id] ?
            (state.stepResults[step.id].success ? 'completed' : 'error') :
            (state.currentStep === index ? 'active' : '');

        const methodClass = step.method.toLowerCase();

        stepsHtml += `
            <div class="step-card ${status}" data-step="${index}">
                <div class="step-number">${state.stepResults[step.id]?.success ? '' : (state.stepResults[step.id]?.error ? '' : index + 1)}</div>
                <div class="step-info">
                    <div class="step-title">${state.currentLang === 'ar' ? step.nameAr : step.nameEn}</div>
                    <div class="step-detail">${state.currentLang === 'ar' ? step.descAr : step.descEn}</div>
                </div>
                <span class="step-method method-badge ${methodClass}">${step.method}</span>
            </div>
        `;
    });

    elements.workflowSteps.innerHTML = stepsHtml;

    // Add event listeners to steps
    document.querySelectorAll('.step-card').forEach(card => {
        card.addEventListener('click', () => {
            state.currentStep = parseInt(card.dataset.step);
            updateActiveStep();
            updateRequestPanel();
        });
    });

    // Add event listeners to scenario buttons
    document.querySelectorAll('.scenario-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.currentScenario = btn.dataset.scenario;
            document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderWorkflow();
        });
    });

    updateActiveStep();
    updateRequestPanel();
}

function updateActiveStep() {
    document.querySelectorAll('.step-card').forEach((card, i) => {
        card.classList.toggle('active', i === state.currentStep && !card.classList.contains('completed') && !card.classList.contains('error'));
    });
}

function updateRequestPanel() {
    const workflow = WORKFLOWS[state.currentWorkflow];
    const visibleSteps = workflow.steps.filter(s => !s.condition || s.condition === state.currentScenario);
    const step = visibleSteps[state.currentStep];

    if (!step) return;

    // Update method and endpoint
    elements.currentMethod.textContent = step.method;
    elements.currentMethod.className = `method-badge ${step.method.toLowerCase()}`;
    elements.currentMethod.textContent = step.method;
    elements.currentMethod.className = `method-badge ${step.method.toLowerCase()}`;
    elements.currentEndpoint.textContent = API_BASE_URL + step.endpoint;

    // Update headers
    elements.requestHeaders.textContent = formatJSON({
        'API-KEY': state.apiKey || 'your-api-key',
        'Content-Type': 'application/json'
    });

    // Update body
    if (step.body) {
        elements.requestBody.value = formatJSON(step.body);
    } else {
        elements.requestBody.value = '';
    }

    // Update cURL
    updateCurlCommand(step);

    // Update form view
    if (step.formFields) {
        renderFormView(step);
    } else {
        elements.workflowForm.innerHTML = `<p style="color: var(--text-muted); text-align: center;">لا توجد حقول إدخال لهذه الخطوة</p>`;
    }
}

function updateCurlCommand(step) {
    let curl = `curl -X ${step.method} "${API_BASE_URL}${step.endpoint}"`;
    curl += `\n  -H "API-KEY: ${state.apiKey || 'your-api-key'}"`;
    curl += `\n  -H "Content-Type: application/json"`;

    if (step.body && ['POST', 'PUT', 'PATCH'].includes(step.method)) {
        curl += `\n  -d '${JSON.stringify(step.body)}'`;
    }

    elements.curlCommand.textContent = curl;
}

function renderFormView(step) {
    if (!step.formFields) return;

    let formHtml = '';

    // Helper to search value in body
    function getValue(obj, key) {
        if (obj[key] !== undefined) return obj[key];
        for (const k in obj) {
            if (typeof obj[k] === 'object' && obj[k]) {
                const res = getValue(obj[k], key);
                if (res !== undefined) return res;
            }
        }
        return undefined;
    }

    step.formFields.forEach(field => {
        const label = state.currentLang === 'ar' ? field.labelAr : field.labelEn;
        const hint = field.hintAr ? (state.currentLang === 'ar' ? field.hintAr : field.hintEn) : '';
        // Get current value from body or default
        let value = getValue(step.body, field.name);
        if (value === undefined || value === null) value = '';

        formHtml += `<div class="form-group">`;
        formHtml += `<label>${label}${field.required ? ' *' : ''}</label>`;

        if (field.type === 'textarea') {
            formHtml += `<textarea class="form-control" name="${field.name}" ${field.required ? 'required' : ''}>${value}</textarea>`;
        } else if (field.type === 'select') {
            formHtml += `<select class="form-control" name="${field.name}" ${field.required ? 'required' : ''}>`;
            formHtml += `<option value="">-- ${t('select')} --</option>`;
            const options = state.cachedData[field.options] || [];
            options.forEach(opt => {
                const selected = (value == opt.id) ? 'selected' : '';
                formHtml += `<option value="${opt.id}" ${selected}>${opt.name || opt.name_ar || opt.id}</option>`;
            });
            formHtml += `</select>`;
        } else if (field.type === 'checkbox') {
            const checked = value ? 'checked' : '';
            formHtml += `<div class="form-check"><input type="checkbox" name="${field.name}" ${checked}><span>${label}</span></div>`;
        } else if (field.type === 'line_items') {
            formHtml += renderLineItemsEditor(value);
        } else {
            formHtml += `<input type="${field.type}" class="form-control" name="${field.name}" value="${value}" ${field.required ? 'required' : ''}>`;
        }

        if (hint) {
            formHtml += `<div class="hint">${hint}</div>`;
        }

        formHtml += `</div>`;
    });

    elements.workflowForm.innerHTML = formHtml;

    // Auto-save changes to step.body
    elements.workflowForm.onchange = (e) => {
        const input = e.target;
        const name = input.name;
        if (!name) return;

        let val;
        if (input.type === 'checkbox') val = input.checked;
        else if (input.type === 'number') val = input.value === '' ? null : Number(input.value);
        else val = input.value;

        // Handle line items array notation
        if (name.startsWith('line_items[')) {
            const match = name.match(/line_items\[(\d+)\]\[(\w+)\]/);
            if (match) {
                const index = parseInt(match[1]);
                const key = match[2];

                let items = [];
                if (step.body.invoice && step.body.invoice.line_items) items = step.body.invoice.line_items;
                else if (step.body.bill && step.body.bill.line_items) items = step.body.bill.line_items;
                else if (step.body.purchase_order && step.body.purchase_order.line_items) items = step.body.purchase_order.line_items;
                else if (step.body.line_items) items = step.body.line_items;

                if (items[index]) {
                    items[index][key] = val;

                    // Auto-fill price if product_id changes
                    if (key === 'product_id') {
                        const product = state.cachedData.products.find(p => p.id == val);
                        if (product) {
                            // Determine which price to use
                            const isPurchase = step.endpoint.includes('purchase') || step.endpoint.includes('bill');
                            const price = isPurchase ? product.buying_price : product.selling_price;

                            // Update state
                            items[index]['unit_price'] = price;

                            // Update UI input if it exists
                            const priceInput = document.querySelector(`input[name="line_items[${index}][unit_price]"]`);
                            if (priceInput) priceInput.value = price;
                        }
                    }
                }
            }
            return;
        }

        // Recursive update
        function update(obj, k, v) {
            if (Object.prototype.hasOwnProperty.call(obj, k)) {
                obj[k] = v;
                return true;
            }
            for (const key in obj) {
                if (typeof obj[key] === 'object' && obj[key]) {
                    if (update(obj[key], k, v)) return true;
                }
            }
            return false;
        }
        update(step.body, name, val);

        // Also update Request Body view if visible
        if (state.currentView === 'postman') {
            elements.requestBody.value = formatJSON(step.body);
        }
    };
}

// Helper to escape HTML values
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderLineItemsEditor(items) {
    // Ensure items is an array
    if (!Array.isArray(items) || items.length === 0) {
        items = [{ product_id: '', quantity: 1, unit_price: '' }];
    }

    const products = state.cachedData.products || [];
    let productOptions = `<option value="">-- ${t('product')} --</option>`;

    products.forEach(p => {
        // Handle name_en/name_ar priority
        const name = p.name_en || p.name_ar || p.name || p.id;
        productOptions += `<option value="${p.id}">${escapeHtml(name)}</option>`;
    });

    let html = `<div class="line-items-editor">`;
    html += `<label>${t('lineItems')}</label>`;

    items.forEach((item, index) => {
        // Auto-calculate Tax % if missing
        let taxPercent = item.tax_percent;
        if (taxPercent === undefined) {
            const product = state.cachedData.products.find(p => p.id == item.product_id);
            if (product) {
                if (product.tax_id && state.cachedData.taxes) {
                    const tax = state.cachedData.taxes.find(t => t.id == product.tax_id);
                    if (tax) taxPercent = tax.value;
                } else {
                    taxPercent = 15;
                }
                // Update the item in memory so it submits correctly even without user interaction
                item.tax_percent = taxPercent;
            }
        }

        // Set selected attribute for the current product
        const rowOptions = productOptions.replace(
            `value="${item.product_id}"`,
            `value="${item.product_id}" selected`
        );

        html += `
            <div class="line-item" data-index="${index}" style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">
                <div class="row" style="display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-end;">
                    <div class="col-product" style="flex: 2; min-width: 200px;">
                         <label style="font-size: 11px; color: #666;">${t('product')}</label>
                         <select class="form-control" name="line_items[${index}][product_id]" required onchange="handleProductChange(this, ${index})">
                            ${rowOptions}
                         </select>
                    </div>
                    <div class="col-desc" style="flex: 2; min-width: 150px;">
                        <label style="font-size: 11px; color: #666;">${t('description')}</label>
                        <input type="text" class="form-control" name="line_items[${index}][description]" placeholder="${t('description')}" value="${item.description || ''}">
                    </div>
                    <div class="col-qty" style="flex: 0.5; min-width: 70px;">
                        <label style="font-size: 11px; color: #666;">${t('quantity')}</label>
                        <input type="number" class="form-control" name="line_items[${index}][quantity]" placeholder="Qty" value="${item.quantity}" min="1" required>
                    </div>
                    <div class="col-price" style="flex: 1; min-width: 100px;">
                        <label style="font-size: 11px; color: #666;">${t('unitPrice')}</label>
                        <input type="number" class="form-control" name="line_items[${index}][unit_price]" placeholder="Price" value="${item.unit_price}" step="0.01" required>
                    </div>
                    <div class="col-tax" style="flex: 0.5; min-width: 70px;">
                        <label style="font-size: 11px; color: #666;">${t('tax')}%</label>
                        <input type="number" class="form-control" name="line_items[${index}][tax_percent]" placeholder="%" value="${taxPercent !== undefined ? taxPercent : ''}" step="0.01">
                    </div>
                     <div class="col-discount" style="flex: 0.5; min-width: 70px;">
                        <label style="font-size: 11px; color: #666;">${t('discount')}</label>
                        <input type="number" class="form-control" name="line_items[${index}][discount]" placeholder="Disc" value="${item.discount || ''}" step="0.01">
                    </div>
                    <div class="col-remove" style="flex: 0.2; min-width: 30px;">
                        <button type="button" class="btn-remove remove-line-item" onclick="removeLineItem(${index})" style="background:none; border:none; color:red; font-size:18px; cursor:pointer;">&times;</button>
                    </div>
                </div>
            </div>
        `;
    });

    html += `<button type="button" class="btn-add add-line-item" onclick="addLineItem()">+ ${t('addItem')}</button>`;
    html += `</div>`;
    return html;
}

// Global handlers
window.handleProductChange = function (select, index) {
    const val = select.value;
    if (!val) return;

    const product = state.cachedData.products.find(p => p.id == val);
    if (product) {
        const step = WORKFLOWS[state.currentWorkflow].steps[state.currentStep];
        const isPurchase = step.endpoint.includes('purchase') || step.endpoint.includes('orders') || step.endpoint.includes('bills');

        const price = isPurchase ? product.buying_price : product.selling_price;
        const description = product.name_en || product.name_ar || product.name;

        // Find tax percent
        let taxPercent = 15; // default
        if (product.tax_id && state.cachedData.taxes) {
            const tax = state.cachedData.taxes.find(t => t.id == product.tax_id);
            if (tax) taxPercent = tax.value;
        }

        // Update UI inputs
        const inputs = document.querySelectorAll(`[name^="line_items[${index}]"]`);
        inputs.forEach(input => {
            if (input.name.includes('[unit_price]')) input.value = price;
            if (input.name.includes('[description]')) input.value = description;
            if (input.name.includes('[tax_percent]')) input.value = taxPercent;
        });

        // Update State
        // Trigger change event to let the global handler update state? 
        // Or update manually. Manual is safer for multiple fields.
        let items = [];
        if (step.body.invoice && step.body.invoice.line_items) items = step.body.invoice.line_items;
        else if (step.body.bill && step.body.bill.line_items) items = step.body.bill.line_items;
        else if (step.body.order && step.body.order.line_items) items = step.body.order.line_items; // Updated for Order
        else if (step.body.purchase_order && step.body.purchase_order.line_items) items = step.body.purchase_order.line_items;
        else if (step.body.line_items) items = step.body.line_items;

        if (items[index]) {
            items[index].product_id = val;
            items[index].unit_price = price;
            items[index].description = description;
            items[index].tax_percent = taxPercent;
        }

        // Update Postman View
        if (state.currentView === 'postman') {
            elements.requestBody.value = formatJSON(step.body);
        }
    }
};

window.fillTestValues = function () {
    const step = WORKFLOWS[state.currentWorkflow].steps[state.currentStep];
    if (!step.formFields) return;

    step.formFields.forEach(field => {
        const input = document.querySelector(`[name="${field.name}"]`);
        if (input && !input.value) {
            if (field.name.includes('date')) input.value = new Date().toISOString().split('T')[0];
            if (field.name === 'reference') input.value = 'REF-' + Math.floor(Math.random() * 1000);
            if (input.tagName === 'SELECT') {
                // Select random option (skip first empty)
                if (input.options.length > 1) {
                    input.selectedIndex = 1 + Math.floor(Math.random() * (input.options.length - 1));
                }
            }
            // Trigger change
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
    showToast('Test values filled', 'success');
};

window.addLineItem = function () {
    // Find the current step and append an empty item
    const step = WORKFLOWS[state.currentWorkflow].steps[state.currentStep];
    let items = [];

    if (step.body.invoice && step.body.invoice.line_items) items = step.body.invoice.line_items;
    else if (step.body.bill && step.body.bill.line_items) items = step.body.bill.line_items;
    else if (step.body.line_items) items = step.body.line_items;

    items.push({ product_id: '', quantity: 1, unit_price: '' });

    // Re-render
    renderFormView(step);
};

window.removeLineItem = function (index) {
    const step = WORKFLOWS[state.currentWorkflow].steps[state.currentStep];
    let items = [];

    if (step.body.invoice && step.body.invoice.line_items) items = step.body.invoice.line_items;
    else if (step.body.bill && step.body.bill.line_items) items = step.body.bill.line_items;
    else if (step.body.line_items) items = step.body.line_items;

    if (items.length > 1) {
        items.splice(index, 1);
        renderFormView(step);
    } else {
        // Don't remove the last item, just clear it? Or allow removal?
        // Usually safe to keep one.
        items[0] = { product_id: '', quantity: 1, unit_price: '' };
        renderFormView(step);
    }
};

function getBodyFromForm(step) {
    if (!step.formFields) return JSON.stringify(step.body);

    const body = JSON.parse(JSON.stringify(step.body));
    const form = elements.workflowForm;

    // Helper to find and update key in object
    function findAndUpdate(obj, key, value) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            obj[key] = value;
            return true;
        }
        for (const k in obj) {
            if (typeof obj[k] === 'object' && obj[k] !== null) {
                if (findAndUpdate(obj[k], key, value)) return true;
            }
        }
        return false;
    }

    step.formFields.forEach(field => {
        if (field.type === 'line_items') return;

        let value = null;
        const input = form.querySelector(`[name="${field.name}"]`);
        if (!input) return;

        if (input.type === 'checkbox') {
            value = input.checked;
        } else if (field.type === 'number') {
            value = input.value === '' ? null : Number(input.value);
        } else {
            value = input.value;
        }

        findAndUpdate(body, field.name, value);
    });

    // Handle line items if present in body and form has editor
    const editor = document.querySelector('.line-items-editor');
    if (editor) {
        const lineItems = getLineItemsFromForm();
        if (lineItems.length > 0) {
            if (typeof body.invoice === 'object') body.invoice.line_items = lineItems;
            else if (typeof body.bill === 'object') body.bill.line_items = lineItems;
            else if (body.line_items) body.line_items = lineItems;
        }
    }

    return JSON.stringify(body);
}

function getLineItemsFromForm() {
    const items = [];
    const editor = document.querySelector('.line-items-editor');
    if (!editor) return items;

    const rows = editor.querySelectorAll('.line-item');
    rows.forEach(row => {
        const productId = row.querySelector('[name="product_id"]')?.value;
        const quantity = row.querySelector('[name="quantity"]')?.value;
        const unitPrice = row.querySelector('[name="unit_price"]')?.value;

        if (productId && quantity) {
            items.push({
                product_id: productId,
                quantity: Number(quantity),
                unit_price: Number(unitPrice || 0)
            });
        }
    });
    return items;
}

// ============================================
// View Toggle
// ============================================
function toggleView(view) {
    state.currentView = view;

    elements.viewPostmanBtn.classList.toggle('active', view === 'postman');
    elements.viewUiBtn.classList.toggle('active', view === 'ui');

    elements.postmanView.classList.toggle('hidden', view !== 'postman');
    elements.uiFormView.classList.toggle('hidden', view !== 'ui');
}

// ============================================
// Panel Tabs
// ============================================
function switchPanel(panel) {
    elements.panelTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.panel === panel);
    });

    document.querySelectorAll('.panel-section').forEach(section => {
        section.classList.toggle('active', section.id === `panel-${panel}`);
    });
}

// ============================================
// API Execution
// ============================================
async function executeCurrentStep() {
    if (!state.apiKey) {
        showToast(t('apiKeyRequired'), 'warning');
        return;
    }

    const workflow = WORKFLOWS[state.currentWorkflow];
    const visibleSteps = workflow.steps.filter(s => !s.condition || s.condition === state.currentScenario);
    const step = visibleSteps[state.currentStep];

    if (!step) return;

    showLoading();
    const startTime = performance.now();

    try {
        let url = API_BASE_URL + step.endpoint;

        // Add query params if present
        if (step.queryParams) {
            const params = new URLSearchParams(step.queryParams);
            url += `?${params}`;
        }

        const options = {
            method: step.method,
            headers: {
                'API-KEY': state.apiKey,
                'Content-Type': 'application/json'
            }
        };

        if (step.body && ['POST', 'PUT', 'PATCH'].includes(step.method)) {
            // Get body from textarea if in postman view
            if (state.currentView === 'postman') {
                options.body = elements.requestBody.value;
            } else {
                // Get from form
                options.body = getBodyFromForm(step);
            }
        }

        const response = await fetch(url, options);
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);

        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        // Update response panel
        elements.responseStatus.textContent = response.status;
        elements.responseStatus.className = `status-badge ${response.ok ? 'success' : 'error'}`;
        elements.responseTime.textContent = `${duration}ms`;
        elements.responseBody.innerHTML = typeof data === 'string' ? data : syntaxHighlight(data);

        // Cache data if it's a list response
        if (response.ok && Array.isArray(data)) {
            cacheResponseData(step.endpoint, data);
        } else if (response.ok && data && typeof data === 'object') {
            // Check for nested arrays
            const keys = Object.keys(data);
            keys.forEach(key => {
                if (Array.isArray(data[key])) {
                    cacheResponseData(step.endpoint, data[key]);
                }
            });
        }

        // Mark step as completed
        state.stepResults[step.id] = { success: response.ok, data };

        // Switch to response panel
        switchPanel('response');

        // Show toast
        if (response.ok) {
            showToast(`${t('success')}: ${response.status}`, 'success');
            // Move to next step if successful
            if (state.currentStep < visibleSteps.length - 1) {
                state.currentStep++;
            }
        } else {
            showToast(`${t('error')}: ${response.status}`, 'error');
        }

        renderWorkflow();

    } catch (error) {
        elements.responseStatus.textContent = 'Error';
        elements.responseStatus.className = 'status-badge error';
        elements.responseBody.textContent = error.message;

        state.stepResults[step.id] = { success: false, error: error.message };
        showToast(`${t('error')}: ${error.message}`, 'error');
        renderWorkflow();
    } finally {
        hideLoading();
    }
}

async function loadAllEntities() {
    state.apiKey = (state.apiKey || elements.apiKeyInput.value).trim();
    if (!state.apiKey) return;

    showToast(t('loading'), 'info');
    elements.refreshBtn.classList.add('rotating');

    const endpoints = [
        { key: 'customers', url: '/customers' },
        { key: 'products', url: '/products?limit=100' },
        { key: 'inventories', url: '/inventories' },
        { key: 'categories', url: '/categories' },
        { key: 'units', url: '/product_unit_types', responseKey: 'product_unit_types' },
        // { key: 'taxes', url: '/tax_rates' }, // Removed as it returns 404
        { key: 'vendors', url: '/vendors' },
        { key: 'accounts', url: '/accounts' },
    ];

    try {
        const promises = endpoints.map(ep =>
            fetch(API_BASE_URL + ep.url, {
                headers: { 'API-KEY': state.apiKey }
            })
                .then(async res => {
                    if (!res.ok) {
                        const errText = await res.text();
                        console.error(`API Error [${ep.key}]: ${res.status}`, errText);
                        return null;
                    }
                    return res.json();
                })
                .then(data => {
                    const dataKey = ep.responseKey || ep.key;
                    if (data && data[dataKey]) {
                        state.cachedData[ep.key] = data[dataKey];
                    }
                })
                .catch(err => console.error(`Failed to load ${ep.key}`, err))
        );

        await Promise.all(promises);
        showToast(t('success'), 'success');
        updateRequestPanel(); // Refresh current view with new data
    } catch (error) {
        console.error('Error loading entities:', error);
        showToast(t('error'), 'error');
    } finally {
        elements.refreshBtn.classList.remove('rotating');
    }
}

function cacheResponseData(endpoint, data) {
    if (endpoint.includes('categories')) {
        state.cachedData.categories = data;
    } else if (endpoint.includes('units')) {
        state.cachedData.units = data;
    } else if (endpoint.includes('inventories')) {
        state.cachedData.inventories = data;
    } else if (endpoint.includes('customers')) {
        state.cachedData.customers = data;
    } else if (endpoint.includes('vendors')) {
        state.cachedData.vendors = data;
    } else if (endpoint.includes('accounts')) {
        state.cachedData.accounts = data;
    } else if (endpoint.includes('invoices')) {
        state.cachedData.invoices = data;
    } else if (endpoint.includes('products')) {
        state.cachedData.products = data;
    }
}

async function runAllSteps() {
    const workflow = WORKFLOWS[state.currentWorkflow];
    const visibleSteps = workflow.steps.filter(s => !s.condition || s.condition === state.currentScenario);

    for (let i = 0; i < visibleSteps.length; i++) {
        state.currentStep = i;
        renderWorkflow();
        await executeCurrentStep();

        // Check if step failed
        const step = visibleSteps[i];
        if (state.stepResults[step.id] && !state.stepResults[step.id].success) {
            break;
        }

        // Small delay between steps
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

function resetWorkflow() {
    state.currentStep = 0;
    state.stepResults = {};
    elements.responseBody.textContent = t('noRequestYet');
    elements.responseStatus.textContent = '-';
    elements.responseStatus.className = 'status-badge';
    elements.responseTime.textContent = '-';
    renderWorkflow();
}

// ============================================
// Copy to Clipboard
// ============================================
function copyCurl() {
    navigator.clipboard.writeText(elements.curlCommand.textContent).then(() => {
        showToast(t('copied'), 'success');
    });
}

// ============================================
// Event Listeners
// ============================================
function initEventListeners() {
    // Language switch
    elements.langSwitch.addEventListener('click', toggleLanguage);

    // API key
    elements.toggleKeyBtn.addEventListener('click', toggleApiKeyVisibility);
    elements.apiKeyInput.addEventListener('input', updateConnectionStatus);

    // Load saved API key
    const savedKey = localStorage.getItem('qoyod_api_key');
    if (savedKey) {
        elements.apiKeyInput.value = savedKey;
        updateConnectionStatus();
    }

    elements.apiKeyInput.addEventListener('input', () => {
        updateConnectionStatus();
        localStorage.setItem('qoyod_api_key', elements.apiKeyInput.value);
    });

    elements.apiBaseUrlInput.addEventListener('input', () => {
        state.apiBaseUrl = elements.apiBaseUrlInput.value.trim();
        localStorage.setItem('qoyod_api_base_url', state.apiBaseUrl);
        updateRequestPanel();
    });

    // Workflow menu
    elements.workflowItems.forEach(item => {
        item.addEventListener('click', () => selectWorkflow(item.dataset.workflow));
    });

    // View toggle
    elements.viewPostmanBtn.addEventListener('click', () => toggleView('postman'));
    elements.viewUiBtn.addEventListener('click', () => toggleView('ui'));

    // Panel tabs
    elements.panelTabs.forEach(tab => {
        tab.addEventListener('click', () => switchPanel(tab.dataset.panel));
    });

    // Execute button
    elements.executeStepBtn.addEventListener('click', executeCurrentStep);

    // Run all button
    elements.runAllBtn.addEventListener('click', runAllSteps);

    // Reset button
    elements.resetBtn.addEventListener('click', resetWorkflow);

    // Copy cURL
    elements.copyCurlBtn.addEventListener('click', copyCurl);

    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            executeCurrentStep();
        }
    });

    // Refresh Data
    if (elements.refreshBtn) {
        elements.refreshBtn.addEventListener('click', async () => {
            if (!state.apiKey) {
                showToast(t('apiKeyRequired'), 'error');
                return;
            }
            elements.refreshBtn.classList.add('fa-spin');
            await loadAllEntities();
            elements.refreshBtn.classList.remove('fa-spin');
        });
    }

    // Fill Data Button
    const fillBtn = document.getElementById('btn-fill-data');
    if (fillBtn) {
        fillBtn.addEventListener('click', () => {
            if (window.fillTestValues) window.fillTestValues();
        });
    }
}

// ============================================
// Initialization
// ============================================
function init() {
    console.log('🚀 Qoyod Workflow Simulator initialized');
    initElements();
    initEventListeners();

    // Load saved settings
    const savedKey = localStorage.getItem('qoyod_api_key');
    if (savedKey) {
        elements.apiKeyInput.value = savedKey;
        updateConnectionStatus();
    }

    const savedBaseUrl = localStorage.getItem('qoyod_api_base_url');
    if (savedBaseUrl) {
        state.apiBaseUrl = savedBaseUrl;
        elements.apiBaseUrlInput.value = savedBaseUrl;
    } else {
        elements.apiBaseUrlInput.value = state.apiBaseUrl;
    }

    updateUILabels();

    // Auto-load entities if API key exists
    if (state.apiKey || elements.apiKeyInput.value) {
        state.apiKey = state.apiKey || elements.apiKeyInput.value;
        loadAllEntities();
    }

    renderWorkflow();
}

document.addEventListener('DOMContentLoaded', init);
