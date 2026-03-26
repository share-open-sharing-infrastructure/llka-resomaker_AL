# Configuration

This application is fully configurable through environment variables. All variables use the `NEXT_PUBLIC_` prefix and are available at build time.

## Quick Start

Copy `.env.local` and uncomment the variables you want to customize:

```bash
cp .env.local .env.local.backup
# Edit .env.local with your values
```

## Configuration Categories

### API (Required)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE` | (required) | PocketBase API URL |
| `NEXT_PUBLIC_BASE_PATH` | (empty) | Sub-path prefix when app is not served at `/` (e.g., `/reservierung`) |

> **Images:** Next.js Image `remotePatterns` are derived automatically from `NEXT_PUBLIC_API_BASE`. In development, `localhost` is also allowed. No manual `next.config.ts` edits are needed.

### Branding

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_BRAND_NAME` | `leih.lokal` | Organization name displayed in header, footer, and calendar events |
| `NEXT_PUBLIC_BRAND_TAGLINE` | `Leihen statt kaufen` | Tagline shown in footer |
| `NEXT_PUBLIC_BRAND_LOGO` | (empty) | Path to logo image; if empty, shows brand name as text |
| `NEXT_PUBLIC_BRAND_ACCENT` | `#000000` | Primary accent color - **must be quoted** (e.g., `"#ff0000"`) |

### SEO / Meta

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_META_TITLE` | `{BRAND_NAME} - {TAGLINE}` | HTML page title |
| `NEXT_PUBLIC_META_DESCRIPTION` | Auto-generated | Meta description for search engines |

### Opening Hours

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_HOURS_JSON` | See below | JSON object mapping day numbers to hours |

Default hours:
```json
{
  "1": "15:00-19:00",
  "4": "15:00-19:00",
  "5": "15:00-19:00",
  "6": "10:00-14:00"
}
```

Day numbers: 0 = Sunday, 1 = Monday, ..., 6 = Saturday

Format: `"HH:MM-HH:MM"` or omit/null for closed days.

### Feature Flags

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_FEATURE_SEARCH` | `true` | Show search bar in catalog |
| `NEXT_PUBLIC_FEATURE_AVAILABILITY_TOGGLE` | `true` | Show available/all items toggle |
| `NEXT_PUBLIC_FEATURE_ITEM_IDS` | `true` | Show item IID badges on cards |
| `NEXT_PUBLIC_FEATURE_DETAIL_PAGES` | `true` | Enable `/[iid]` detail pages |
| `NEXT_PUBLIC_FEATURE_URL_PARAMS` | `true` | Sync search/filter/page state with URL |
| `NEXT_PUBLIC_FEATURE_TIME_SELECTION` | `true` | Show time picker; if false, auto-selects last slot |
| `NEXT_PUBLIC_FEATURE_DEPOSIT` | `true` | Show deposit amounts |
| `NEXT_PUBLIC_FEATURE_COPIES` | `true` | Show available copies count |
| `NEXT_PUBLIC_FEATURE_CALENDAR_BUTTONS` | `true` | Show "Add to Calendar" buttons on success page |

### Limits

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_LIMIT_CART_ITEMS` | `10` | Maximum items in cart (0 = unlimited) |
| `NEXT_PUBLIC_LIMIT_PICKUP_DAYS` | `28` | How many days ahead users can book pickup |
| `NEXT_PUBLIC_LIMIT_ITEMS_PER_PAGE` | `24` | Items per page in catalog |

### Defaults

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_DEFAULT_AVAILABLE_ONLY` | `true` | Default state of availability filter |
| `NEXT_PUBLIC_DEFAULT_SORT` | `name` | Default sort field for items |

### Display

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_DISPLAY_CURRENCY` | `€` | Currency symbol for deposit display |

## Example Configurations

### Minimal (text-only, no frills)

```env
NEXT_PUBLIC_API_BASE=https://api.example.com
NEXT_PUBLIC_BRAND_NAME=Leihladen
NEXT_PUBLIC_FEATURE_SEARCH=false
NEXT_PUBLIC_FEATURE_AVAILABILITY_TOGGLE=false
NEXT_PUBLIC_FEATURE_ITEM_IDS=false
NEXT_PUBLIC_FEATURE_DETAIL_PAGES=false
NEXT_PUBLIC_FEATURE_TIME_SELECTION=false
```

### Full-featured with custom branding

```env
NEXT_PUBLIC_API_BASE=https://api.example.com
NEXT_PUBLIC_BRAND_NAME=Stadtbibliothek Werkzeugverleih
NEXT_PUBLIC_BRAND_TAGLINE=Werkzeuge für alle
NEXT_PUBLIC_BRAND_LOGO=/logo.svg
NEXT_PUBLIC_BRAND_ACCENT="#2563eb"
NEXT_PUBLIC_HOURS_JSON={"1":"10:00-18:00","2":"10:00-18:00","3":"10:00-18:00","4":"10:00-20:00","5":"10:00-18:00"}
NEXT_PUBLIC_LIMIT_CART_ITEMS=5
NEXT_PUBLIC_LIMIT_PICKUP_DAYS=14
```

## Using the Accent Color

The accent color is available as a CSS variable:

```css
.my-element {
  color: var(--brand-accent);
  border-color: var(--brand-accent);
}
```

## Docker

Build and run with Docker:

```bash
# Using docker-compose (edit docker-compose.yml first)
docker-compose up --build

# Or build directly with custom config
docker build \
  --build-arg NEXT_PUBLIC_API_BASE=https://api.example.com \
  --build-arg NEXT_PUBLIC_BRAND_NAME="My Library" \
  --build-arg NEXT_PUBLIC_BRAND_ACCENT="#2563eb" \
  -t reservation-app .

docker run -p 3000:3000 reservation-app
```

**Note:** Configuration is baked in at build time. To change config, rebuild the image.

## Notes

- All `NEXT_PUBLIC_` variables are embedded at build time
- Changes require rebuilding the application
- Boolean values accept `true`/`false` or `1`/`0`
- Invalid JSON in `HOURS_JSON` falls back to defaults
