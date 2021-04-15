const core = require("@actions/core");
const { GITHUB_ACTIONS_BOT_NAME } = require("../utils");
const fs = require("fs");

/**
 * Creates teams based on the names that are in the "people" folder. It checks
 * whether there are any existing teams and attempts to restore them if so. It will
 * then randomly assign each newly added person to a random team.
 */
const createTeams = async () => {
  try {
    const team_size = core.getInput("team_size");
    const total_people = core.getInput("total_people");
    const total_teams = Math.floor(total_people / team_size);

    console.log(`Total people: ${total_people}`);
    console.log(`Total per team: ${team_size}`);
    console.log(`Total teams: ${total_teams}`);

    const teams_file_path = `${process.env.GITHUB_WORKSPACE}/public/resources/teams.json`;
    const teams_file_contents = fs.readFileSync(teams_file_path);

    const people_folder_path = `${process.env.GITHUB_WORKSPACE}/people`;
    const people = fs
      .readdirSync(people_folder_path)
      .filter((person) => person !== GITHUB_ACTIONS_BOT_NAME);

    let existing_teams;

    try {
      existing_teams = JSON.parse(teams_file_contents).teams;
    } catch {
      // This catch runs when someone tampers with "teams.json" manually.
      existing_teams = [[]];

      // eslint-disable-next-line no-console
      console.log("An error occured while trying to restore existing teams.");
    }

    const remove_tuples = [];

    // Remove orphans i.e. names that exist in teams.json but not in the people folder.
    existing_teams.forEach((team, team_idx) => {
      team.forEach((person, person_idx) => {
        if (!people.includes(person)) {
          remove_tuples.push([team_idx, person_idx]);
        }
      });
    });

    if (remove_tuples.length) {
      console.log("Found some orphaned people:");

      remove_tuples.forEach(([team_idx, person_idx]) => {
        console.log(`- ${existing_teams[team_idx][person_idx]}`);
        existing_teams[team_idx].splice(person_idx, 1);
      });
    }

    /**
     * Get the newly added names (they weren't part of the "teams.json" yet).
     * We'll use this later to set a COMMIT_MSG.
     */
    const new_names = people.reduce((names, person) => {
      return existing_teams.some((team) => team.includes(person))
        ? names
        : [...names, person];
    }, []);

    console.log("New names:", { new_names });

    const teams = [...existing_teams];

    if (teams.length < total_teams) {
      for (let i = teams.length; i < total_teams; i++) {
        teams.push([]);
      }
    }

    // Assign each new person to a random team.
    new_names.forEach((person) => {
      let iterations = 0;

      while (true) {
        const random_idx = Math.floor(Math.random() * total_teams);
        const random_team = teams[random_idx];

        if (random_team.length < team_size) {
          random_team.push(person);
          break;
        }

        /**
         * Loop trap. If this is (ever) triggered, either:
         * - Wait for the next merge to main so this resolves itself.
         * - Trigger the action manually.
         */
        if (iterations > 100) {
          break;
        }

        iterations++;
      }
    });

    /**
     * Write updates teams to the "teams.json" file. In the next step we'll
     * check whether the file has been updated. And if so, we'll create a new
     * PR there.
     */
    fs.writeFileSync(teams_file_path, JSON.stringify({ teams }, null, 4));
    console.log({ teams, new_names });

    if (new_names.length === 1) {
      core.setOutput("commit_msg", `feat: add ${new_names[0]} to teams.json`);
    } else if (new_names.length > 1) {
      const first_names = new_names.slice(0, new_names.length).join(", ");
      const last_name = new_names[new_names.length - 1];
      core.setOutput(
        "commit_msg",
        `feat: add ${first_names} and ${last_name} to teams.json`
      );
    } else {
      core.setOutput("commit_msg", `feat: remove orphans`);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log({ error });
  }
};

createTeams().catch((e) => core.setFailed(e));
