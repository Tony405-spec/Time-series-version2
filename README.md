# Time Series Version 2

A Vite + React + TypeScript learning app for exploring time-series dashboards, trend analysis, regression, feature engineering, hybrid models, forecasting, and model comparisons.

## Quick Start

```bash
npm install
npm run dev
```

## Available Commands

```bash
npm run build
npm run lint
npm run preview
```

## CSV Input Expectations

The upload workflow expects time-series records with:

- A date or timestamp column that can be parsed by the browser.
- A numeric value column.
- One observation per row.
- Consistent frequency when comparing trends or forecast output.

Avoid blank dates, non-numeric values, and mixed date formats. Clean or aggregate raw data before upload when the source contains duplicate timestamps.

## Project Structure

```text
src/
  components/        App views and feature panels
  components/charts/ Chart components
  App.tsx            Main tab routing
```

## Current Limitations

- Some forecasting demos intentionally use simple client-side simulations.
- No automated unit-test runner is configured yet.
- Forecast results should be treated as learning outputs, not production forecasts.
