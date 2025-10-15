# Go API Front

A modern front-end application for interacting with the Go API system. Built with React, TypeScript, and Vite.

## Features

- Modular architecture with reusable components
- State management using custom store providers
- XML formatting and linting utilities
- Pre-commit hooks for code quality
- Integrated ESLint and TypeScript support
- GitHub Actions CI for build and test automation

## Project Structure

```
.env
.env.template
src/
  App.tsx
  main.tsx
  components/
  constants/
  hook/
  interfaces/
  services/
  store/
  types/
  utils/
.vscode/
.github/
.lsp/
.remote-scripts/
...
```

## Getting Started

### Prerequisites

- Node.js (v18 recommended)
- npm

### Installation

```sh
npm install
```

### Development

```sh
npm run dev
```

### Build

```sh
npm run build
```

### Test

```sh
npm test
```

## Code Quality

Pre-commit hooks are configured via [pre-commit-build.yaml](pre-commit-build.yaml) and remote scripts. ESLint and TypeScript are enforced.

## Continuous Integration

GitHub Actions workflow is defined in [.github/workflows/build.yml](.github/workflows/build.yml) for automated build and test.

## License

This project is licensed under the MIT License.

## Author

[Rafael24595](https://github.com/Rafael24595)