rm -rf .very_secret_folder/dist/ | true

ncc build \
    .github/actions/check-pull-request/check-pull-request.js \
    --out .very_secret_folder/dist/check-pull-request \
    --license licenses.txt \
    --no-cache

ncc build \
    .github/actions/check-approvals/check-approvals.js \
    --out .very_secret_folder/dist/check-approvals \
    --license licenses.txt \
    --no-cache

ncc build \
    .github/actions/create-teams/create-teams.js \
    --out .very_secret_folder/dist/create-teams \
    --license licenses.txt \