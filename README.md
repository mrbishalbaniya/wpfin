# Personal Finance Tracker

A modern, full-stack personal finance tracking application built with Next.js and WordPress as a headless CMS.

## 🚀 Features

### Core Functionality
- **User Authentication** - Secure JWT-based login/register system
- **Transaction Management** - Add, edit, delete income and expense transactions
- **Dashboard Analytics** - Real-time financial overview with charts and summaries
- **Category Management** - Organize transactions by customizable categories
- **Financial Reports** - Detailed analytics with date filtering and CSV export
- **Responsive Design** - Works seamlessly on desktop and mobile devices

### Advanced Features
- **Monthly Trends** - Track income vs expense patterns over time
- **Category Breakdown** - Pie charts showing spending distribution
- **Savings Rate Calculation** - Monitor your financial health
- **Search & Filtering** - Find transactions quickly with advanced filters
- **Data Export** - Export financial data to CSV for external analysis
- **Nepali Currency Support** - Built-in NPR formatting

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Beautiful, responsive charts
- **Axios** - HTTP client for API calls
- **React Hook Form** - Form handling and validation
- **Lucide React** - Modern icon library

### Backend
- **WordPress** - Headless CMS and API backend
- **WordPress REST API** - RESTful API endpoints
- **JWT Authentication** - Secure token-based auth
- **Advanced Custom Fields (ACF)** - Custom data structures
- **MySQL** - Database storage

## 📁 Project Structure

```
personal-finance-tracker/
├── app/                          # Next.js App Router pages
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── dashboard/           # Main dashboard page
│   │   ├── transactions/        # Transaction management
│   │   ├── add-transaction/     # Add new transactions
│   │   ├── reports/            # Financial reports
│   │   └── profile/            # User profile settings
│   ├── login/                  # Authentication pages
│   ├── register/
│   ├── globals.css             # Global styles
│   └── layout.tsx              # Root layout
├── components/                  # Reusable React components
│   ├── Navbar.tsx              # Navigation header
│   ├── Sidebar.tsx             # Dashboard sidebar
│   ├── SummaryCards.tsx        # Financial summary cards
│   ├── TransactionForm.tsx     # Transaction form component
│   ├── TransactionTable.tsx    # Transaction data table
│   └── Charts.tsx              # Chart components
├── lib/                        # Utility libraries
│   ├── api.ts                  # WordPress API client
│   ├── auth.ts                 # Authentication utilities
│   ├── finance.ts              # Financial calculations
│   └── utils.ts                # General utilities
├── middleware.ts               # Route protection middleware
└── WORDPRESS_SETUP.md          # Backend setup guide
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- WordPress installation (local or hosted)
- Basic knowledge of React and WordPress

### 1. Clone and Install

```bash
git clone <repository-url>
cd personal-finance-tracker
npm install
```

### 2. Environment Setup

Create `.env.local` file:

```env
# WordPress Backend Configuration
WORDPRESS_API_URL=http://localhost/wp-json/wp/v2
WORDPRESS_JWT_URL=http://localhost/wp-json/jwt-auth/v1
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key
```

### 3. WordPress Backend Setup

Follow the detailed [WordPress Setup Guide](./WORDPRESS_SETUP.md) to:
- Install required plugins (JWT Auth, ACF)
- Configure custom post types
- Set up API endpoints
- Configure security settings

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 API Endpoints

### Authentication
- `POST /wp-json/jwt-auth/v1/token` - User login
- `POST /wp-json/jwt-auth/v1/token/validate` - Validate JWT token

### Transactions
- `GET /wp-json/wp/v2/transactions` - Get user transactions
- `POST /wp-json/wp/v2/transactions` - Create new transaction
- `PUT /wp-json/wp/v2/transactions/{id}` - Update transaction
- `DELETE /wp-json/wp/v2/transactions/{id}` - Delete transaction

### Categories & Users
- `GET /wp-json/wp/v2/categories` - Get finance categories
- `GET /wp-json/wp/v2/users/me` - Get current user info
- `POST /wp-json/wp/v2/users` - Register new user

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Route Protection** - Middleware-based route guarding
- **User Data Isolation** - Users can only access their own data
- **CORS Configuration** - Proper cross-origin resource sharing
- **Input Validation** - Form validation and sanitization
- **Secure Cookies** - HTTP-only, secure cookie storage

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop** - Full-featured dashboard experience
- **Tablet** - Optimized layouts for medium screens
- **Mobile** - Touch-friendly interface with collapsible navigation

## 🎨 UI/UX Features

- **Modern Design** - Clean, professional interface
- **Dark/Light Mode Ready** - Prepared for theme switching
- **Loading States** - Smooth loading indicators
- **Error Handling** - User-friendly error messages
- **Success Feedback** - Clear success confirmations
- **Accessibility** - WCAG compliant components

## 📈 Financial Analytics

### Dashboard Metrics
- Total Income, Expenses, and Balance
- Monthly trends and comparisons
- Savings rate calculation
- Transaction count summaries

### Charts & Visualizations
- **Line Charts** - Monthly income vs expense trends
- **Pie Charts** - Category-wise spending breakdown
- **Bar Charts** - Monthly balance visualization
- **Summary Cards** - Key financial indicators

### Reports & Export
- Date range filtering
- Category-wise breakdowns
- CSV data export
- Trend analysis

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Quality
- **TypeScript** - Full type safety
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting (recommended)
- **Husky** - Git hooks (optional)

## 🚀 Deployment

### Frontend (Next.js)
Deploy to platforms like:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **DigitalOcean App Platform**

### Backend (WordPress)
Host WordPress on:
- **Local development** - XAMPP, WAMP, or Docker
- **Shared hosting** - Most WordPress hosts
- **VPS/Cloud** - DigitalOcean, AWS, Google Cloud
- **Managed WordPress** - WP Engine, Kinsta

### Environment Variables
Update production environment variables:
- Use HTTPS URLs for production
- Generate strong JWT secrets
- Configure proper CORS settings
- Enable SSL/TLS certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues
- **CORS Errors** - Check WordPress CORS configuration
- **Authentication Issues** - Verify JWT plugin setup
- **API Connection** - Confirm WordPress REST API is enabled
- **Permission Errors** - Check user roles and capabilities

### Getting Help
- Check the [WordPress Setup Guide](./WORDPRESS_SETUP.md)
- Review the troubleshooting section
- Open an issue for bugs or feature requests

## 🎯 Roadmap

### Upcoming Features
- **Budget Management** - Set and track monthly budgets
- **Recurring Transactions** - Automate regular income/expenses
- **Multi-Currency Support** - Support for multiple currencies
- **Bank Integration** - Connect bank accounts (future)
- **Mobile App** - React Native mobile application
- **AI Insights** - Smart spending analysis and recommendations

### Performance Improvements
- **Caching** - Implement API response caching
- **Pagination** - Optimize large transaction lists
- **Lazy Loading** - Improve initial page load times
- **PWA Features** - Offline support and app-like experience

---

**Built with ❤️ using Next.js and WordPress**