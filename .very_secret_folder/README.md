# Stop! This folder is secret and you shouldn't be here.

But since you're already here we might aswell explain what this folder is.

This folder hosts a couple folders and files:

- `dist`: This is where our compiled logic lives, this is where GitHub looks when executing an action (such as `check-approvals`, `check-pull-request` or `create-teams`).
- `scripts`: When we make any changes to the source code (e.g. some logic was updated) we need to compile that new code so that GitHub will execute the new logic in the future. Whenever a developer makes changes to `scripts/build.sh` we should run `npm run build` which in turn runs `sh build.sh`.
- `README.md`: You're looking at it right now.
