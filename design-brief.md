# Design Brief — Norte

## 1. Product & user

**Norte** is a single-user personal finance tracker. Its core idea is **capture-first**: the
app's job is to make logging a transaction fast, so the home screen is a quick-add form, not a
dashboard. Reports and budgets deliberately live in a separate future product ("Norte Web") — this
brief only covers the mobile capture app.

Brand tone: calm, precise, a little premium (the gold accent below is deliberate — this is a
finance tool, not a toy). Not playful, not corporate-cold.

## 2. Platform & modes

- **Mobile-first**, single column, thumb-reachable primary actions.
- **Dark mode is the default** experience. **Light mode** is a required secondary theme, not an
  afterthought. Please design both.

## 3. Visual language (guardrails — propose freely within them)

These are fixed brand values, pulled directly from the app's design tokens. Everything else
(layout, spacing, component shapes, iconography, motion) is open — propose what best serves a
capture-first finance app.

**Color — dark (default):**
| Token | Hex | Use |
|---|---|---|
| Background | `#0e0f13` | app background |
| Surface | `#16181f` | cards, sheets |
| Surface 2 | `#1e2129` | nested/elevated surfaces |
| Border | `#2a2e39` | dividers, outlines |
| Text | `#f3f5f7` | primary text |
| Text dim | `#9aa2b1` | secondary/meta text |
| Gold (accent) | `#d4af37` | brand accent, primary actions, highlights — use deliberately, not everywhere |
| Income | `#3fb98c` | positive amounts, income movements |
| Expense | `#e5484d` | negative amounts, expense movements |

**Color — light (same roles, different values):**
| Token | Hex |
|---|---|
| Background | `#f7f8fa` |
| Surface | `#ffffff` |
| Surface 2 | `#eef0f4` |
| Border | `#d9dce3` |
| Text | `#14161b` |
| Text dim | `#5b6472` |

Gold, income, and expense stay the same across both themes.

**Typography:**
- Display / headings: **Sora**
- Body / UI text: **Manrope**
- Both are geometric, modern sans-serifs — lean into clean numeral rendering, since this app is
  amount-heavy (currency figures should be legible and well-spaced).

**Logo:** a compass mark (concept only — no existing asset). If a logo/icon is needed for the
mockup, propose a simple compass-derived mark consistent with the gold accent; don't treat it as
final brand art.

## 4. Screens to design

Design all five as a connected mobile flow, both themes.

### 4.1 Login
Email + password form. Single-user app, so no signup/social-login flows needed. Should feel like
the calm, premium front door to the brand — this is the user's first impression of Norte.

### 4.2 Home — Summary by month (default screen after login)
The primary screen. Shows movements (income/expense transactions) for the current month:
- Month navigator (previous/next month)
- Summary of totals for the month (income vs. expense, net)
- Filter controls (by type / category / account)
- List of movements, each showing: type (income/expense), amount (colored via the income/expense
  tokens), category, account, date, description
- Empty state: no movements yet this month
- Quick path to add a new movement (this is the capture-first core action — make it prominent)

### 4.3 Add movement
Quick-add form, reachable in one tap from anywhere in the app. Fields: type (income/expense),
amount, category, account, date, description. Should feel fast — minimal friction, large touch
targets, sensible defaults (e.g. date = today).

### 4.4 Accounts (Cuentas)
List of the user's accounts with their current balances. Include a transfer flow (move money
between two accounts) — can be a bottom sheet / modal over the account list.
- Empty state: no accounts yet

### 4.5 Expenses
A focused view for adding/reviewing expenses specifically (distinct from the general
add-movement flow — treat it as an expense-oriented quick-add).

## 5. What we want from OpenPencil

- Mobile frames for all five screens above, **in both dark and light theme**.
- Free rein on layout, information hierarchy, spacing, card/button shapes, iconography, and
  micro-interactions — use the color and type tokens above as the palette, but don't feel bound
  to any particular arrangement.
- Treat "amount" as the most important piece of information on any card or row — it should read
  instantly, colored correctly by income/expense.
- Consistent component language across all five screens (same card style, same button style,
  same input style) rather than one-off treatments per screen.
