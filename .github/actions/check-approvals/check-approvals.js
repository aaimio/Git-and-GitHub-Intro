const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/action");
const {
  GITHUB_ACTIONS_BOT_NAME,
  review_events,
  review_states,
} = require("../utils");

const octokit = new Octokit();

/**
 * Check whether there were 2 approvals from other people (other than
 * the GITHUB_ACTIONS_BOT_NAME. If that's the case, we can authoritatively
 * approve this PR (with a green check mark) so one of the mentors can
 * merge this PR. This should be enforced through branch protection rules.
 * @param {Number} pull_number The number of the pull request to check.
 */
const checkApprovals = async () => {
  try {
    console.log(
      `Getting all pull requests for this ${github.context.repo.owner}/${github.context.repo.repo}...`
    );
    const pull_requests = await octokit.request(
      "GET /repos/{owner}/{repo}/pulls?state=open&per_page=100",
      {
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
      }
    );

    if (pull_requests.data.length === 0) {
      console.log("Found no pull requests. Exiting early.");
      return;
    }

    console.log(`Found ${pull_requests.data.length} pull requests.`);

    for (let i = 0; i < pull_requests.data.length; i++) {
      const pull_request = pull_requests.data[i];
      const { number: pull_number } = pull_request;
      const reviews = await octokit.pulls.listReviews({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        pull_number,
      });

      console.log(
        `\nPull request ${pull_number} has ${reviews.data.length} reviews. Checking whether I should comment.`
      );

      // Don't let people approve multiple times.
      const approver_ids = [];
      const approved_reviews = reviews.data.filter((review) => {
        if (
          review.state === review_states.APPROVED &&
          !approver_ids.includes(review.user.id)
        ) {
          approver_ids.push(review.user.id);
          return true;
        }

        return false;
      });

      if (approved_reviews.length === 1) {
        console.log(
          "There is a potentially eligible approval, checking whether I should comment."
        );
        // Additional check to see if we should post a comment, i.e. if a user
        // approves multiple times, we don't want to comment again and again.
        const message_start = "One approval down thanks to";
        const should_comment = !reviews.data.some(
          (review) =>
            review.user.login === GITHUB_ACTIONS_BOT_NAME &&
            review.body.indexOf(message_start) > -1
        );

        console.log(`Should I comment? ${should_comment ? "Yes" : "No"}`);

        if (should_comment) {
          const approver_name = `@${approved_reviews[0].user.login}`;

          await octokit.pulls.createReview({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            pull_number,
            event: review_events.COMMENT,
            body: `${message_start} ${approver_name} 🔥, one still to go.`,
          });
        }
      } else if (approved_reviews.length > 1) {
        console.log(
          "There are multiple potential eligible approvals, checking whether I should comment."
        );
        const message_start = "Thanks to";
        const should_comment = !reviews.data.some(
          (review) =>
            review.user.login === GITHUB_ACTIONS_BOT_NAME &&
            review.body.indexOf(message_start) > -1
        );

        console.log(`Should I comment? ${should_comment ? "Yes" : "No"}`);

        if (should_comment) {
          const approver_names = approved_reviews.map(
            (review) => `@${review.user.login}`
          );
          const approver_names_string = `${approver_names
            .slice(0, approver_names.length - 1)
            .join(", ")} and ${approver_names[approver_names.length - 1]}`;

          await octokit.pulls.createReview({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            pull_number,
            event: review_events.APPROVE,
            body: `${message_start} ${approver_names_string} this pull request is ready to be merged. 😁\n\nLet your mentor know and help your fellow developers in the mean time.`,
          });
        }
      } else {
        console.log("There aren't any eligible approvals, I'm not commenting.");
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log({ error });
  }
};

checkApprovals().catch((e) => core.setFailed(e));
