# WordPress Backend Setup Guide

This guide will help you set up WordPress as a headless backend for the Personal Finance Tracker.

## Prerequisites

- WordPress installation (local or hosted)
- Admin access to WordPress
- Basic knowledge of WordPress plugins

## Required Plugins

### 1. JWT Authentication for WP REST API

**Plugin:** JWT Authentication for WP REST API
**Download:** https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/

**Installation:**
1. Install and activate the plugin
2. Add the following to your `wp-config.php`:

```php
define('JWT_AUTH_SECRET_KEY', 'your-top-secret-key');
define('JWT_AUTH_CORS_ENABLE', true);
```

3. Add to `.htaccess`:
```apache
RewriteEngine On
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]
```

### 2. Advanced Custom Fields (ACF)

**Plugin:** Advanced Custom Fields
**Download:** https://wordpress.org/plugins/advanced-custom-fields/

**Installation:**
1. Install and activate the plugin
2. We'll configure fields programmatically (see below)

### 3. WPGraphQL (Optional but Recommended)

**Plugin:** WPGraphQL
**Download:** https://wordpress.org/plugins/wp-graphql/

## Custom Post Types Setup

Add the following code to your theme's `functions.php` file:

```php
<?php
// Register Custom Post Types for Finance Tracker

// 1. Transactions Post Type
function register_transactions_post_type() {
    $args = array(
        'label' => 'Transactions',
        'public' => true,
        'show_in_rest' => true,
        'rest_base' => 'transactions',
        'supports' => array('title', 'editor', 'author', 'custom-fields'),
        'capability_type' => 'post',
        'map_meta_cap' => true,
        'menu_icon' => 'dashicons-money-alt',
    );
    register_post_type('transaction', $args);
}
add_action('init', 'register_transactions_post_type');

// 2. Categories Post Type
function register_categories_post_type() {
    $args = array(
        'label' => 'Finance Categories',
        'public' => true,
        'show_in_rest' => true,
        'rest_base' => 'categories',
        'supports' => array('title', 'editor', 'custom-fields'),
        'menu_icon' => 'dashicons-category',
    );
    register_post_type('finance_category', $args);
}
add_action('init', 'register_categories_post_type');

// 3. Budgets Post Type (for future use)
function register_budgets_post_type() {
    $args = array(
        'label' => 'Budgets',
        'public' => true,
        'show_in_rest' => true,
        'rest_base' => 'budgets',
        'supports' => array('title', 'editor', 'author', 'custom-fields'),
        'capability_type' => 'post',
        'map_meta_cap' => true,
        'menu_icon' => 'dashicons-chart-pie',
    );
    register_post_type('budget', $args);
}
add_action('init', 'register_budgets_post_type');

// ACF Fields for Transactions
if (function_exists('acf_add_local_field_group')) {
    acf_add_local_field_group(array(
        'key' => 'group_transactions',
        'title' => 'Transaction Fields',
        'fields' => array(
            array(
                'key' => 'field_amount',
                'label' => 'Amount',
                'name' => 'amount',
                'type' => 'number',
                'required' => 1,
                'min' => 0,
                'step' => 0.01,
            ),
            array(
                'key' => 'field_type',
                'label' => 'Type',
                'name' => 'type',
                'type' => 'select',
                'required' => 1,
                'choices' => array(
                    'income' => 'Income',
                    'expense' => 'Expense',
                ),
            ),
            array(
                'key' => 'field_category',
                'label' => 'Category',
                'name' => 'category',
                'type' => 'text',
                'required' => 1,
            ),
            array(
                'key' => 'field_date',
                'label' => 'Date',
                'name' => 'date',
                'type' => 'date_picker',
                'required' => 1,
                'display_format' => 'Y-m-d',
                'return_format' => 'Y-m-d',
            ),
            array(
                'key' => 'field_note',
                'label' => 'Note',
                'name' => 'note',
                'type' => 'textarea',
                'rows' => 3,
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'transaction',
                ),
            ),
        ),
    ));

    // ACF Fields for Categories
    acf_add_local_field_group(array(
        'key' => 'group_categories',
        'title' => 'Category Fields',
        'fields' => array(
            array(
                'key' => 'field_category_type',
                'label' => 'Category Type',
                'name' => 'type',
                'type' => 'select',
                'choices' => array(
                    'income' => 'Income',
                    'expense' => 'Expense',
                    'both' => 'Both',
                ),
                'default_value' => 'expense',
            ),
            array(
                'key' => 'field_category_color',
                'label' => 'Color',
                'name' => 'color',
                'type' => 'color_picker',
                'default_value' => '#3b82f6',
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'finance_category',
                ),
            ),
        ),
    ));
}

// Ensure user can only access their own transactions
function filter_transactions_by_user($args, $request) {
    if ($request->get_route() === '/wp/v2/transactions') {
        $args['author'] = get_current_user_id();
    }
    return $args;
}
add_filter('rest_transaction_query', 'filter_transactions_by_user', 10, 2);

// CORS Headers for API
function add_cors_http_header() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
}
add_action('init', 'add_cors_http_header');

// Handle preflight requests
function handle_preflight() {
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        exit(0);
    }
}
add_action('init', 'handle_preflight');
?>
```

## API Endpoints

After setup, your WordPress will provide these REST API endpoints:

### Authentication
- `POST /wp-json/jwt-auth/v1/token` - Login
- `POST /wp-json/jwt-auth/v1/token/validate` - Validate token

### Transactions
- `GET /wp-json/wp/v2/transactions` - Get transactions
- `POST /wp-json/wp/v2/transactions` - Create transaction
- `PUT /wp-json/wp/v2/transactions/{id}` - Update transaction
- `DELETE /wp-json/wp/v2/transactions/{id}` - Delete transaction

### Categories
- `GET /wp-json/wp/v2/categories` - Get categories
- `POST /wp-json/wp/v2/categories` - Create category

### Users
- `GET /wp-json/wp/v2/users/me` - Get current user
- `POST /wp-json/wp/v2/users` - Register user

## Default Categories Setup

Run this in WordPress admin or add to functions.php to create default categories:

```php
function create_default_finance_categories() {
    $categories = array(
        array('name' => 'Salary', 'type' => 'income', 'color' => '#22c55e'),
        array('name' => 'Freelance', 'type' => 'income', 'color' => '#3b82f6'),
        array('name' => 'Investment', 'type' => 'income', 'color' => '#8b5cf6'),
        array('name' => 'Food & Dining', 'type' => 'expense', 'color' => '#ef4444'),
        array('name' => 'Transportation', 'type' => 'expense', 'color' => '#f59e0b'),
        array('name' => 'Shopping', 'type' => 'expense', 'color' => '#ec4899'),
        array('name' => 'Bills & Utilities', 'type' => 'expense', 'color' => '#6b7280'),
        array('name' => 'Healthcare', 'type' => 'expense', 'color' => '#06b6d4'),
        array('name' => 'Entertainment', 'type' => 'expense', 'color' => '#f97316'),
        array('name' => 'Education', 'type' => 'expense', 'color' => '#84cc16'),
    );

    foreach ($categories as $category) {
        $post_id = wp_insert_post(array(
            'post_title' => $category['name'],
            'post_type' => 'finance_category',
            'post_status' => 'publish',
        ));

        if ($post_id) {
            update_field('type', $category['type'], $post_id);
            update_field('color', $category['color'], $post_id);
        }
    }
}

// Run once to create default categories
// create_default_finance_categories();
```

## Security Configuration

### 1. User Permissions
Ensure users can only access their own data by adding this to functions.php:

```php
// Restrict transaction access to post author
function restrict_transaction_access($prepared, $request) {
    if ($prepared->post_type === 'transaction') {
        $current_user = wp_get_current_user();
        if ($prepared->post_author != $current_user->ID && !current_user_can('administrator')) {
            return new WP_Error('rest_forbidden', 'You can only access your own transactions.', array('status' => 403));
        }
    }
    return $prepared;
}
add_filter('rest_pre_insert_transaction', 'restrict_transaction_access');
```

### 2. Environment Variables
Set these in your WordPress environment:

```php
// wp-config.php
define('JWT_AUTH_SECRET_KEY', 'your-super-secret-key-here');
define('JWT_AUTH_CORS_ENABLE', true);
```

## Testing the Setup

1. **Test JWT Authentication:**
```bash
curl -X POST http://your-wordpress-site/wp-json/jwt-auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{"username":"your-username","password":"your-password"}'
```

2. **Test Transaction Creation:**
```bash
curl -X POST http://your-wordpress-site/wp-json/wp/v2/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Test Transaction",
    "status": "publish",
    "acf": {
      "amount": 100,
      "type": "expense",
      "category": "Food & Dining",
      "date": "2024-01-01",
      "note": "Test note"
    }
  }'
```

## Troubleshooting

### Common Issues:

1. **CORS Errors:** Ensure CORS headers are properly set in functions.php
2. **JWT Token Issues:** Check that JWT_AUTH_SECRET_KEY is set in wp-config.php
3. **Permission Errors:** Verify user roles and capabilities
4. **ACF Fields Not Showing:** Ensure ACF plugin is active and fields are registered

### Debug Mode:
Enable WordPress debug mode in wp-config.php:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

## Production Considerations

1. **Security:** Use strong JWT secret keys
2. **SSL:** Always use HTTPS in production
3. **Rate Limiting:** Implement API rate limiting
4. **Backup:** Regular database backups
5. **Caching:** Consider API response caching for better performance

## Next Steps

1. Update the `.env.local` file in your Next.js project with your WordPress URLs
2. Test the authentication flow
3. Create some sample transactions
4. Verify the frontend can connect to your WordPress backend

Your WordPress backend is now ready to serve as the API for your Personal Finance Tracker!