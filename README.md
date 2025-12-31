# Trustified Simplified - Fitness Supplement Testing Platform

A modern, comprehensive web application for displaying fitness supplement test reports and reviews. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

### 🏠 Home Page
- **Dynamic Navbar**: Easy navigation with category links
- **Auto-Scrolling Slideshow**: Beautiful hero section with search functionality
- **Category-Based Product Display**: Products organized by category with smooth horizontal auto-scrolling
- **Interactive Product Cards**: Hover effects with product highlighting and elevation
- **Real-time Data**: Fetches latest product reports from Supabase

### 📂 Category Pages
- **Filtered Product Grid**: 2-3 products per row responsive layout
- **Advanced Filtering Sidebar**:
  - Verdict filter (Pass/Fail/Pending/Not Assigned)
  - Price range slider
  - Protein per serving filter (for protein categories)
  - Multiple filter selection support
- **Real-time Filter Updates**: Instant product filtering without page reload
- **Filter Status Indicators**: Shows active filter count

### 🔍 Product Detail Pages
- **Large Product Images**: High-quality product visualization
- **Comprehensive Product Information**:
  - Product name, company, category
  - Price and price per serving
  - Overall verdict
- **Detailed Test Reports**:
  - **Basic Tests**: Protein, carbs, fats per serving with claimed vs tested values
  - **Contaminant Tests**: Heavy metals, pesticides, aflatoxins, amino/melamine spiking
  - **Review Section**: Taste, mixability, packaging, serving size accuracy
- **Color-Coded Results**:
  - Green background for passed sections
  - Red background for failed sections
  - Individual test result badges
- **Expandable Sections**: Click to expand/collapse test details
- **Video Reviews**: Direct links to YouTube review videos

### 🔎 Search Functionality
- **Global Search Bar**: Search by product name, brand, or category
- **Smart Search Results**: Displays matching products with relevance
- **Empty State Handling**: User-friendly messages when no results found

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Image Optimization**: Next.js Image component
- **State Management**: React Hooks

## Project Structure

```
src/
├── app/
│   ├── category/[category]/     # Category page with filters
│   ├── product/[productId]/     # Dynamic product detail pages
│   ├── search/                  # Search results page
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── components/
│   ├── Navbar.tsx              # Navigation bar
│   ├── ProductCard.tsx         # Product card component
│   ├── CategoryScroll.tsx      # Horizontal scrolling category section
│   ├── Slideshow.tsx           # Hero slideshow with search
│   ├── FilterSidebar.tsx       # Category page filter sidebar
│   └── TestSection.tsx         # Expandable test report section
├── lib/
│   └── supabase.ts             # Supabase client configuration
└── types/
    └── index.ts                # TypeScript type definitions
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account and project
- npm or yarn package manager

### Environment Setup

1. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_ANON_KEY=your_supabase_anon_key
```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Database Schema

The application uses a Supabase `reports` table with the following structure:

- `id`: Primary key
- `product_id`: Unique product identifier
- `product_name`: Product name
- `product_category`: Category (Whey Concentrate, Whey Isolate, etc.)
- `company`: Manufacturer name
- `verdict`: Pass/Fail/Pending/Not Assigned
- `price`: Product price
- `price_per_serving`: Calculated per-serving cost
- `image_url`: Product image URL
- `image_status`: Image processing status
- `video_url`: YouTube review video
- `results`: JSONB containing test results and reviews
- Timestamps and indexes for performance

## Key Features Explained

### Auto-Scrolling with Hover Pause
Products in category sections automatically scroll horizontally at a medium pace. When you hover over a product, the scrolling pauses, and the product highlights with a lift animation.

### Expandable Test Sections
Test report sections are collapsible for better UX. Each section shows:
- Section title and overall verdict
- Expandable/collapsible content
- Individual test results with claimed vs tested values
- Color-coded verdict badges
- Detailed notes where applicable

### Smart Filtering
The filter sidebar supports:
- Multiple simultaneous filters
- Real-time product count updates
- Clear all functionality
- Category-specific filters (e.g., protein filters only for whey categories)

### Responsive Design
- Mobile-first approach
- Hamburger menu for mobile navigation
- Responsive grid layouts (1-4 columns based on screen size)
- Touch-friendly interactions

## Design System

### Colors
- **Primary**: Emerald/Dark Green (#059669, #047857, #065f46)
- **Background**: White (#FFFFFF)
- **Pass Status**: Green (#10B981)
- **Fail Status**: Red (#EF4444)
- **Neutral**: Gray scale

### Typography
- Font Family: Sora (primary)
- Headings: Bold, dark gray/black
- Body: Regular, medium gray

### Animations
- Smooth transitions (300ms)
- Hover scale and elevation effects
- Slide transitions for slideshow
- Smooth scroll behavior

## Future Enhancements

- User authentication and saved favorites
- Product comparison feature
- Advanced analytics and charts
- User reviews and ratings
- Email notifications for new reports
- Export reports as PDF
- Social sharing capabilities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For issues or questions, please open an issue on the repository or contact the development team.

---

Built with ❤️ for Trustified
