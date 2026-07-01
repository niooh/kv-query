If you'd like to contribute to the codebase, please follow these steps:

1. Fork the repository and create your feature branch:
   ```bash
   git fetch upstream && git checkout main && git rebase upstream/main
   git checkout -b new-feature
   npm install
   # after modifying, run `npm run check`, `npm run build`, `npm run build:bin` to ensure they run properly
   ```

2. Commit your changes with a clear message, using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add some feature"
   ```

3. Push to your branch:
   ```bash
   git push origin new-feature
   ```

4. Open a Pull Request, referencing the format in `PULL_REQUEST_TEMPLATE.md`.
