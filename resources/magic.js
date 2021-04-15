"use strict";

const Teams = () => {
  const [is_loading, setIsLoading] = React.useState(true);
  const [teams, setTeams] = React.useState(false);

  React.useEffect(() => {
    fetch("./resources/teams.json")
      .then((response) => response.json())
      .then((data) => {
        console.log({ data });
        setTeams(data.teams);
        setIsLoading(false);
      });
  }, []);

  if (is_loading) {
    return <div>Teams are loading...</div>;
  }

  return (
    <div className="teams">
      {teams.map((team, idx) => (
        <div key={idx} className="teams__team">
          <h1 className="teams__team-header">Team {idx + 1}</h1>
          {team.map((person) => (
            <div key={person} className="teams__person">
              <a
                href={`https://github.com/${person}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {person}
              </a>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const el_root = document.getElementById("root");
ReactDOM.render(<Teams />, el_root);
