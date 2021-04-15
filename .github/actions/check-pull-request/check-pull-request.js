const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/action");
const { review_events, GITHUB_ACTIONS_BOT_NAME } = require("../utils");
const octokit = new Octokit();

/**
 * Get the files for this PR, it should always be a single file
 * with a name equal to the user that opened the PR. The file
 * should contain a description of the user.
 * @param {Number} pull_number The number of the pull request to check.
 */
const checkPullRequest = async (pull_number) => {
  try {
    const [pull_request, pull_files] = await Promise.all([
      octokit.pulls.get({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        pull_number,
      }),
      octokit.pulls.listFiles({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        pull_number,
      }),
    ]);

    if (pull_files.data.length === 1) {
      // We should always have only a single file committed (per PR) to the repo.
      const file = pull_files.data[0];
      const { login } = pull_request.data.user;

      if (file.filename === login || file.filename === `people/${login}`) {
        /**
         * We should comment in most cases, unless the PR is already mergeable
         * (due to being previously approved) and the most recent review is
         * not equal to an approval. In that case the most recent approval is
         * still valid, no need to repeat ourselves.
         */
        const should_comment = await (async () => {
          const reviews_by_bot = await getReviewsByBot(pull_number);
          return (
            reviews_by_bot.length === 0 ||
            reviews_by_bot[reviews_by_bot.length - 1].state ===
              review_events.APPROVE
          );
        })();

        if (should_comment) {
          // Successful pull request.
          const is_first_run = await isFirstRunOfAction(pull_number);
          const message_start = is_first_run
            ? "**That is what we call a hole-in-one! Bonus points for you. 💯**"
            : "Great, that's the way!";

          await octokit.pulls.createReview({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            pull_number,
            event: review_events.COMMENT,
            body: `${message_start}\n\nThe file name matches your username.\n\nAsk two of your fellow developers to approve this pull request and we'll get your name and description merged to the upstream repo asap.`,
          });
        }
      } else {
        // Unsuccessful pull request: File name doesn't match user's GitHub username.
        await octokit.pulls.createReview({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          pull_number,
          event: review_events.REQUEST_CHANGES,
          body: `It looks like the file name committed in this pull request doesn\'t match your username 😩. Please update the PR and try again.\n\nIf you need any help feel free to ask any of your mentors or fellow developers.\n\n**Protip**:\n- Your username is **${login}**\n- Do not include any file extension (e.g. .txt, .mp3)`,
        });
      }
    } else {
      // Unsuccessful pull request: Too many files added/updated in this PR.
      await octokit.pulls.createReview({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        pull_number,
        event: review_events.REQUEST_CHANGES,
        body: `It looks like you've added or updated too many files in this pull request 😔.\n\nPlease remove any unnecessary files, commit the changes, and try again.\n\nIf you need any help doing this feel free to ask any of your fellow developers or mentors.`,
      });
    }
  } catch (error) {
    // Unsuccessful pull request: Technical issues
    console.log({ error }); // eslint-disable-line no-console

    await octokit.pulls.createReview({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number,
      event: review_events.COMMENT,
      body: `Oops, some GitHub magic went wrong, please let your mentor know so they can investigate what\'s up.`,
    });
  }
};

/**
 * Get reviews submitted by the GITHUB_ACTIONS_BOT_NAME for the pull request
 * with the passed pull_number.
 * @param {Number} pull_number
 * @returns {Array} A chronological list of reviews.
 */
const getReviewsByBot = async (pull_number) => {
  const reviews = await octokit.pulls.listReviews({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number,
  });

  return reviews.data.filter(
    (review) => review.user.login === GITHUB_ACTIONS_BOT_NAME
  );
};

/**
 * We assume "isFirstRunOfAction" when there isn't any review
 * from the GITHUB_ACTIONS_BOT_NAME account. Therefore it is important
 * not to add any new fancy reviews from at least that account.
 * @param {Number} pull_number The pull request number
 * @returns
 */
const isFirstRunOfAction = async (pull_number) =>
  (await getReviewsByBot(pull_number)).length === 0;

checkPullRequest(github.context.payload.number).catch((e) => core.setFailed(e));
