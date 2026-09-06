# Contributing to OurHour ☀️

Thank you for your interest in contributing to **OurHour**! We welcome community contributions to help improve the solar-normalized circadian time engine, user interface, documentation, and mathematical models.

---

## 🛠️ Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/FranciscoReyne/Our-Hour.git
   cd Our-Hour
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Run the test suite:**
   ```bash
   npm run test
   ```

---

## 🧪 Testing Guidelines

- All mathematical transformations must maintain sub-millisecond precision and adhere to the 14 core mathematical assertions in `tests/engine.test.ts`.
- Ensure new features include unit tests in Vitest.
- Run `npm run build` to verify strict TypeScript type checking before submitting a PR.

---

## 🚀 Submitting Pull Requests

1. Create a descriptive feature branch (`git checkout -b feature/amazing-feature`).
2. Make your changes and write tests.
3. Ensure all tests and builds pass (`npm run test && npm run build`).
4. Commit your changes with clear, descriptive commit messages.
5. Push to your branch (`git push origin feature/amazing-feature`).
6. Open a Pull Request referencing any related issues.

Thank you for making OurHour better!
