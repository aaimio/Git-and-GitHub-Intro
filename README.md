# Goal of this repository

- **Creating your first pull request**, by adding your name to the `people` folder and opening a PR on GitHub.
- **Get a basic introduction to collaborating on GitHub**, through reviews from bots and your peers.

---

# The task

1. **Fork this repository to your own GitHub account**
   - If you're reading this on GitHub then there should be a **Fork** button at the top of this page, click that button.
   - If you're reading this elsewhere, go to the URL of this repository on GitHub.
2. **Clone the repository**
   - You can do so by going to your terminal and writing the command below:

```bash
$ git clone git@github.com:<your_github_username>/Your-First-PR.git
```

3. **Install dependencies**

```bash
$ npm install
```

4. **Add an empty file (without file extension) named after your GitHub username to the `people` folder (e.g. `torvalds`)**
   - **Protip**: Use the `touch` command in your terminal to create a new empty file.

```bash
$ touch people/<YOUR_USERNAME>
```

5. **Create a pull request from your fork to this repository**
   - After creating a PR, the [github-actions[bot]](https://github.com/apps/github-actions) will review your PR immediately.
     - If the bot is happy, ask two of your peers to approve your pull request (this can be anyone).
     - If the bot is not happy, they will tell you what needs to be updated.
6. **Help your friends or wait for a couple minutes**. After the [github-actions[bot]](https://github.com/apps/github-actions) is happy with your PR, it will check every 5 minutes or so to check whether you've obtained enough approvals for your PR to be merged to `main`.
7. Everything is OK? Tell one of your mentors to merge your PR.
8. After a mentor has merged your PR, your name will be automatically assigned to a team.

---

<details>
   <summary>Click here to reveal information for wizards</summary>

# Files and folders

- `.github`
  - `actions`
    - `check-approvals`
      - `action.yml`: Action definition
      - `check-approvals.js`: Action source code
    - `check-pull-request`: Action definition
      - `action.yml`: Action definition
      - `check-pull-request`: Action source code
    - `create-teams`
      - `action.yml`: Action definition
      - `create-teams.js`: Action source code
  - `workflows`
    - `check-approvals.yml`: Action configuration, you can define check interval here (5 mins is GitHub restriction).
    - `check-pull-request.yml`: Action configuration
    - `create-teams.yml`: Action configuration, you can define team size and total people here.
- `.husky`
  - `.gitignore`
  - `pre-commit`: File that contains commands to execute pre-commit.
- `.very_secret_folder`
  - `dist`: Folder containing the compiled GitHub Actions source code (compiled using `@vercel/ncc` in `build.sh`).
  - `scripts`: Folder containing build script(s), this is referenced in the `package.json`
- `people`: This is where people will add their GitHub username as a file to, this folder is used in `check-pull-request` and `create-teams` actions.
  - For `check-pull-request` we check whether the file name matches the PR opener's username.
  - For `create-teams` we use this folder as base to assign people to `teams.json`.
- `public`: This is a folder we'll automagically deploy on each merge to main (after the `create-teams` action). This will showcase the generated teams.
  - `resources`
    - `magic.js`: A small React component that represents the elements we'll show to the user. It's included through a `text/babel` tag in `index.html` allowing us to use modern JS and React. If you want to change how the teams are presented you can do so here.
    - `styles.css`: Simple stylesheet to create a somewhat presentable team overview.
    - `teams.json`: Contains the teams that were generated in `create-teams` GitHub Action.
  - `index.html`: Simple `index.html` that represents the team overview page. This page includes React, ReactDOM, and Babel through a simple `script` tag. If you wish to add new elements, you can do so here.
  </details>
