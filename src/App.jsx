import React, { useEffect, useMemo, useState } from "react";
import "./styles.css";

// Position choices used throughout the app
const POSITION_OPTIONS = ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF"];

// Game setup choices
const GAME_TYPE_OPTIONS = ["Pool", "Bracket", "League", "Scrimmage"];
const INNING_OPTIONS = [3, 4, 5, 6, 7];

// Helpful position groups for analysis
const INFIELD_POSITIONS = ["P", "C", "1B", "2B", "3B", "SS"];
const OUTFIELD_POSITIONS = ["LF", "CF", "RF"];
const MIDDLE_INFIELD_ALERT_POSITIONS = ["2B", "SS", "3B", "P", "C"];

// localStorage key
const STORAGE_KEY = "dugout-iq-app-data-v2";

// ----------------------------
// SAMPLE / DEFAULT DATA
// ----------------------------

const SAMPLE_PLAYERS = [
  {
    id: 1,
    name: "Avery",
    jerseyNumber: "2",
    role: "Core Starter",
    eligiblePositions: ["SS", "2B", "CF"],
    preferredPositions: ["SS"],
    emergencyOnlyPositions: ["P"],
    notUsedTherePositions: ["C"],
    notes: "Strong glove, quick first step."
  },
  {
    id: 2,
    name: "Brooklyn",
    jerseyNumber: "7",
    role: "Core Starter",
    eligiblePositions: ["P", "1B"],
    preferredPositions: ["P"],
    emergencyOnlyPositions: ["CF"],
    notUsedTherePositions: ["C"],
    notes: "Primary pitcher."
  },
  {
    id: 3,
    name: "Cam",
    jerseyNumber: "11",
    role: "Rotation Player",
    eligiblePositions: ["LF", "CF", "RF"],
    preferredPositions: ["CF"],
    emergencyOnlyPositions: ["2B"],
    notUsedTherePositions: ["P", "C"],
    notes: "Covers a lot of ground in the outfield."
  },
  {
    id: 4,
    name: "Dakota",
    jerseyNumber: "4",
    role: "Core Starter",
    eligiblePositions: ["C", "3B"],
    preferredPositions: ["C"],
    emergencyOnlyPositions: ["1B"],
    notUsedTherePositions: ["SS"],
    notes: "Team catcher."
  },
  {
    id: 5,
    name: "Emerson",
    jerseyNumber: "10",
    role: "Development Player",
    eligiblePositions: ["2B", "LF"],
    preferredPositions: ["2B"],
    emergencyOnlyPositions: ["RF"],
    notUsedTherePositions: ["P", "C"],
    notes: "Still learning footwork."
  },
  {
    id: 6,
    name: "Finley",
    jerseyNumber: "13",
    role: "Rotation Player",
    eligiblePositions: ["1B", "RF"],
    preferredPositions: ["1B"],
    emergencyOnlyPositions: ["3B"],
    notUsedTherePositions: ["SS", "C"],
    notes: "Reliable hands at first."
  },
  {
    id: 7,
    name: "Gray",
    jerseyNumber: "5",
    role: "Situational Player",
    eligiblePositions: ["RF", "LF"],
    preferredPositions: ["RF"],
    emergencyOnlyPositions: ["2B"],
    notUsedTherePositions: ["P", "C", "SS"],
    notes: "Good attitude, useful late-game sub."
  },
  {
    id: 8,
    name: "Harper",
    jerseyNumber: "8",
    role: "Core Starter",
    eligiblePositions: ["3B", "SS"],
    preferredPositions: ["3B"],
    emergencyOnlyPositions: ["1B"],
    notUsedTherePositions: ["C"],
    notes: "Strong arm across the diamond."
  },
  {
    id: 9,
    name: "Indy",
    jerseyNumber: "1",
    role: "Development Player",
    eligiblePositions: ["LF", "RF", "2B"],
    preferredPositions: ["LF"],
    emergencyOnlyPositions: [],
    notUsedTherePositions: ["P", "C", "SS"],
    notes: "Needs reps, improving confidence."
  }
];

const createSampleTeamSettings = () => ({
  teamName: "Dugout IQ Demo Team",
  ageGroup: "10U",
  sport: "softball",
  teamType: "Travel",
  fairnessPriority: "Medium",
  developmentPriority: "High",
  competitivenessPriority: "High"
});

const createEmptyPlayer = () => ({
  id: Date.now() + Math.random(),
  name: "",
  jerseyNumber: "",
  role: "Rotation Player",
  eligiblePositions: [],
  preferredPositions: [],
  emergencyOnlyPositions: [],
  notUsedTherePositions: [],
  notes: ""
});

const createEmptyInning = (inningNumber) => ({
  inningNumber,
  defense: {
    P: "",
    C: "",
    "1B": "",
    "2B": "",
    "3B": "",
    SS: "",
    LF: "",
    CF: "",
    RF: ""
  },
  benchPlayerIds: [],
  pitcher: "",
  catcher: ""
});

const buildInningData = (inningCount, existingInningData = []) => {
  const nextInnings = [];

  for (let i = 1; i <= inningCount; i += 1) {
    const existing = existingInningData.find(
      (inning) => inning.inningNumber === i
    );

    if (existing) {
      nextInnings.push(existing);
    } else {
      nextInnings.push(createEmptyInning(i));
    }
  }

  return nextInnings;
};

const createBlankGame = () => {
  const gameId = Date.now() + Math.random();

  return {
    id: gameId,
    date: "",
    opponent: "",
    gameType: "Pool",
    innings: 5,
    gameNotes: "",
    battingOrder: ["", "", "", "", "", "", "", "", ""],
    inningData: buildInningData(5)
  };
};

const createSampleGame = () => ({
  id: 1001,
  date: "2026-03-17",
  opponent: "Lady Hawks",
  gameType: "Pool",
  innings: 5,
  gameNotes: "Sample game entry for Dugout IQ testing.",
  battingOrder: [1, 2, 4, 8, 3, 6, 5, 9, 7],
  inningData: [
    {
      inningNumber: 1,
      defense: {
        P: 2,
        C: 4,
        "1B": 6,
        "2B": 5,
        "3B": 8,
        SS: 1,
        LF: 9,
        CF: 3,
        RF: 7
      },
      benchPlayerIds: [],
      pitcher: 2,
      catcher: 4
    },
    {
      inningNumber: 2,
      defense: {
        P: 2,
        C: 4,
        "1B": 6,
        "2B": 1,
        "3B": 8,
        SS: 5,
        LF: 7,
        CF: 3,
        RF: 9
      },
      benchPlayerIds: [],
      pitcher: 2,
      catcher: 4
    },
    {
      inningNumber: 3,
      defense: {
        P: 2,
        C: 4,
        "1B": 6,
        "2B": 5,
        "3B": 8,
        SS: 1,
        LF: 7,
        CF: 3,
        RF: 9
      },
      benchPlayerIds: [],
      pitcher: 2,
      catcher: 4
    },
    {
      inningNumber: 4,
      defense: {
        P: 2,
        C: 4,
        "1B": 6,
        "2B": 5,
        "3B": 8,
        SS: 1,
        LF: 9,
        CF: 3,
        RF: 7
      },
      benchPlayerIds: [],
      pitcher: 2,
      catcher: 4
    },
    {
      inningNumber: 5,
      defense: {
        P: 2,
        C: 4,
        "1B": 6,
        "2B": 5,
        "3B": 8,
        SS: 1,
        LF: 9,
        CF: 3,
        RF: 7
      },
      benchPlayerIds: [],
      pitcher: 2,
      catcher: 4
    }
  ]
});

const createSampleAppData = () => {
  const sampleGame = createSampleGame();

  return {
    teamSettings: createSampleTeamSettings(),
    players: SAMPLE_PLAYERS,
    games: [sampleGame],
    selectedGameId: sampleGame.id
  };
};

const getPlayerDisplayName = (player) => {
  if (!player) return "Unknown Player";

  if (player.name && player.jerseyNumber) {
    return `${player.name} #${player.jerseyNumber}`;
  }

  if (player.name) return player.name;
  if (player.jerseyNumber) return `#${player.jerseyNumber}`;

  return "Unnamed Player";
};

const getGameListLabel = (game) => {
  const datePart = game.date || "No date";
  const opponentPart = game.opponent || "No opponent";
  return `${datePart} vs ${opponentPart}`;
};

const getInitialAppData = () => {
  if (typeof window === "undefined") {
    return createSampleAppData();
  }

  try {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (!savedData) {
      return createSampleAppData();
    }

    const parsedData = JSON.parse(savedData);

    if (
      !parsedData ||
      !parsedData.teamSettings ||
      !parsedData.players ||
      !Array.isArray(parsedData.games)
    ) {
      return createSampleAppData();
    }

    const normalizedGames = parsedData.games.map((game) => ({
      ...game,
      inningData: buildInningData(game.innings || 5, game.inningData || [])
    }));

    const selectedGameStillExists = normalizedGames.some(
      (game) => game.id === parsedData.selectedGameId
    );

    return {
      teamSettings: parsedData.teamSettings,
      players: parsedData.players,
      games: normalizedGames.length > 0 ? normalizedGames : [createSampleGame()],
      selectedGameId: selectedGameStillExists
        ? parsedData.selectedGameId
        : normalizedGames.length > 0
          ? normalizedGames[0].id
          : createSampleGame().id
    };
  } catch (error) {
    console.error("Could not load saved Dugout IQ data:", error);
    return createSampleAppData();
  }
};

export default function App() {
  const initialAppData = useMemo(() => getInitialAppData(), []);

  const [teamSettings, setTeamSettings] = useState(initialAppData.teamSettings);
  const [players, setPlayers] = useState(initialAppData.players);
  const [games, setGames] = useState(initialAppData.games);
  const [selectedGameId, setSelectedGameId] = useState(
    initialAppData.selectedGameId
  );
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    if (!saveStatus) return;

    const timer = setTimeout(() => {
      setSaveStatus("");
    }, 2000);

    return () => clearTimeout(timer);
  }, [saveStatus]);

  const selectedGame = useMemo(() => {
    return games.find((game) => game.id === selectedGameId) || null;
  }, [games, selectedGameId]);

  const playerOptions = useMemo(() => {
    return players.map((player) => ({
      id: player.id,
      label: getPlayerDisplayName(player)
    }));
  }, [players]);

  const handleSaveData = () => {
    try {
      const appDataToSave = {
        teamSettings,
        players,
        games,
        selectedGameId
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(appDataToSave));
      setSaveStatus("Saved");
    } catch (error) {
      console.error("Could not save Dugout IQ data:", error);
      setSaveStatus("Save failed");
    }
  };

  const handleResetToSampleData = () => {
    const sampleData = createSampleAppData();

    setTeamSettings(sampleData.teamSettings);
    setPlayers(sampleData.players);
    setGames(sampleData.games);
    setSelectedGameId(sampleData.selectedGameId);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
      setSaveStatus("Reset to sample data");
    } catch (error) {
      console.error("Could not reset Dugout IQ data:", error);
      setSaveStatus("Reset failed");
    }
  };

  const handleTeamSettingChange = (field, value) => {
    setTeamSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlayerFieldChange = (playerId, field, value) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) =>
        player.id === playerId ? { ...player, [field]: value } : player
      )
    );
  };

  const handleTogglePosition = (playerId, field, position) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => {
        if (player.id !== playerId) return player;

        const currentValues = player[field];
        const alreadySelected = currentValues.includes(position);

        const updatedValues = alreadySelected
          ? currentValues.filter((p) => p !== position)
          : [...currentValues, position];

        return {
          ...player,
          [field]: updatedValues
        };
      })
    );
  };

  const handleAddPlayer = () => {
    setPlayers((prevPlayers) => [...prevPlayers, createEmptyPlayer()]);
  };

  const handleRemovePlayer = (playerId) => {
    setPlayers((prevPlayers) =>
      prevPlayers.filter((player) => player.id !== playerId)
    );

    setGames((prevGames) =>
      prevGames.map((game) => ({
        ...game,
        battingOrder: game.battingOrder.map((id) => (id === playerId ? "" : id)),
        inningData: game.inningData.map((inning) => {
          const updatedDefense = { ...inning.defense };

          POSITION_OPTIONS.forEach((position) => {
            if (updatedDefense[position] === playerId) {
              updatedDefense[position] = "";
            }
          });

          return {
            ...inning,
            defense: updatedDefense,
            benchPlayerIds: inning.benchPlayerIds.filter((id) => id !== playerId),
            pitcher: inning.pitcher === playerId ? "" : inning.pitcher,
            catcher: inning.catcher === playerId ? "" : inning.catcher
          };
        })
      }))
    );
  };

  const handleCreateNewGame = () => {
    const newGame = createBlankGame();
    setGames((prevGames) => [newGame, ...prevGames]);
    setSelectedGameId(newGame.id);
  };

  const handleDeleteGame = (gameIdToDelete) => {
    setGames((prevGames) => {
      const updatedGames = prevGames.filter((game) => game.id !== gameIdToDelete);

      if (selectedGameId === gameIdToDelete) {
        setSelectedGameId(updatedGames.length > 0 ? updatedGames[0].id : null);
      }

      return updatedGames;
    });
  };

  const updateSelectedGame = (updater) => {
    if (!selectedGameId) return;

    setGames((prevGames) =>
      prevGames.map((game) =>
        game.id === selectedGameId ? updater(game) : game
      )
    );
  };

  const handleGameFieldChange = (field, value) => {
    updateSelectedGame((game) => ({
      ...game,
      [field]: value
    }));
  };

  const handleInningsChange = (value) => {
    const inningCount = Number(value);

    updateSelectedGame((game) => ({
      ...game,
      innings: inningCount,
      inningData: buildInningData(inningCount, game.inningData)
    }));
  };

  const handleBattingOrderChange = (spotIndex, value) => {
    const playerId = value === "" ? "" : Number(value);

    updateSelectedGame((game) => {
      const updatedBattingOrder = [...game.battingOrder];
      updatedBattingOrder[spotIndex] = playerId;

      return {
        ...game,
        battingOrder: updatedBattingOrder
      };
    });
  };

  const handleAddBattingSpot = () => {
    updateSelectedGame((game) => ({
      ...game,
      battingOrder: [...game.battingOrder, ""]
    }));
  };

  const handleRemoveBattingSpot = () => {
    updateSelectedGame((game) => {
      if (game.battingOrder.length <= 1) return game;

      return {
        ...game,
        battingOrder: game.battingOrder.slice(0, -1)
      };
    });
  };

  const handleDefenseChange = (inningNumber, position, value) => {
    const playerId = value === "" ? "" : Number(value);

    updateSelectedGame((game) => ({
      ...game,
      inningData: game.inningData.map((inning) =>
        inning.inningNumber === inningNumber
          ? {
              ...inning,
              defense: {
                ...inning.defense,
                [position]: playerId
              }
            }
          : inning
      )
    }));
  };

  const handleBenchToggle = (inningNumber, playerId) => {
    updateSelectedGame((game) => ({
      ...game,
      inningData: game.inningData.map((inning) => {
        if (inning.inningNumber !== inningNumber) return inning;

        const alreadyBenched = inning.benchPlayerIds.includes(playerId);

        return {
          ...inning,
          benchPlayerIds: alreadyBenched
            ? inning.benchPlayerIds.filter((id) => id !== playerId)
            : [...inning.benchPlayerIds, playerId]
        };
      })
    }));
  };

  const handleBatteryChange = (inningNumber, field, value) => {
    const playerId = value === "" ? "" : Number(value);

    updateSelectedGame((game) => ({
      ...game,
      inningData: game.inningData.map((inning) =>
        inning.inningNumber === inningNumber
          ? {
              ...inning,
              [field]: playerId
            }
          : inning
      )
    }));
  };

  const analysisRows = useMemo(() => {
    if (!selectedGame) return [];

    const rows = players.map((player) => ({
      playerId: player.id,
      playerName: getPlayerDisplayName(player),
      role: player.role,
      benchInnings: 0,
      infieldInnings: 0,
      outfieldInnings: 0,
      pitcherInnings: 0,
      catcherInnings: 0,
      totalDefensiveInnings: 0,
      middleGroupRepInnings: 0
    }));

    const rowMap = {};
    rows.forEach((row) => {
      rowMap[row.playerId] = row;
    });

    selectedGame.inningData.forEach((inning) => {
      inning.benchPlayerIds.forEach((playerId) => {
        if (rowMap[playerId]) {
          rowMap[playerId].benchInnings += 1;
        }
      });

      const defensivePlayersThisInning = new Set();

      POSITION_OPTIONS.forEach((position) => {
        const assignedPlayerId = inning.defense[position];

        if (!assignedPlayerId || !rowMap[assignedPlayerId]) return;

        defensivePlayersThisInning.add(assignedPlayerId);

        if (INFIELD_POSITIONS.includes(position)) {
          rowMap[assignedPlayerId].infieldInnings += 1;
        }

        if (OUTFIELD_POSITIONS.includes(position)) {
          rowMap[assignedPlayerId].outfieldInnings += 1;
        }

        if (MIDDLE_INFIELD_ALERT_POSITIONS.includes(position)) {
          rowMap[assignedPlayerId].middleGroupRepInnings += 1;
        }
      });

      defensivePlayersThisInning.forEach((playerId) => {
        rowMap[playerId].totalDefensiveInnings += 1;
      });

      const pitcherId = inning.pitcher || inning.defense.P;
      if (pitcherId && rowMap[pitcherId]) {
        rowMap[pitcherId].pitcherInnings += 1;
      }

      const catcherId = inning.catcher || inning.defense.C;
      if (catcherId && rowMap[catcherId]) {
        rowMap[catcherId].catcherInnings += 1;
      }
    });

    return rows;
  }, [players, selectedGame]);

  const analysisAlerts = useMemo(() => {
    const alerts = [];

    if (!selectedGame) return alerts;

    const totalInnings = selectedGame.inningData.length;

    if (analysisRows.length === 0 || totalInnings === 0) {
      return alerts;
    }

    const benchValues = analysisRows.map((row) => row.benchInnings);
    const maxBench = Math.max(...benchValues);
    const minBench = Math.min(...benchValues);

    if (maxBench - minBench >= 2) {
      alerts.push("Bench usage is uneven across the roster.");
    }

    const playersWithMiddleGroupReps = analysisRows.filter(
      (row) => row.middleGroupRepInnings > 0
    ).length;

    if (
      totalInnings >= 3 &&
      analysisRows.length >= 6 &&
      playersWithMiddleGroupReps <= 3
    ) {
      alerts.push("Middle infield reps are concentrated in a small group.");
    }

    const totalCatcherInnings = analysisRows.reduce(
      (sum, row) => sum + row.catcherInnings,
      0
    );

    const topCatcherRow = [...analysisRows].sort(
      (a, b) => b.catcherInnings - a.catcherInnings
    )[0];

    if (
      topCatcherRow &&
      totalCatcherInnings > 0 &&
      topCatcherRow.catcherInnings / totalCatcherInnings >= 0.75
    ) {
      alerts.push("Catcher workload is concentrated.");
    }

    const developmentPlayers = analysisRows.filter(
      (row) => row.role === "Development Player"
    );

    const developmentPlayersWithLowUsage = developmentPlayers.filter(
      (row) =>
        row.totalDefensiveInnings <= Math.max(1, Math.floor(totalInnings / 3))
    );

    if (
      developmentPlayers.length > 0 &&
      developmentPlayersWithLowUsage.length > 0
    ) {
      alerts.push("Some development players had limited opportunities.");
    }

    if (teamSettings.fairnessPriority === "High" && maxBench - minBench >= 1) {
      alerts.push("Usage may not fully align with the selected fairness priority.");
    }

    if (
      teamSettings.developmentPriority === "High" &&
      developmentPlayersWithLowUsage.length > 0
    ) {
      alerts.push(
        "Usage may not fully align with the selected development priority."
      );
    }

    return alerts;
  }, [analysisRows, selectedGame, teamSettings]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div>
            <div className="eyebrow">Dugout IQ</div>
            <h1>Game Day Planner</h1>
            <p>
              Team setup, roster management, game tracking, and inning-by-inning analysis.
            </p>
          </div>

          <div className="header-badge-stack">
            <div className="header-badge">
              {teamSettings.sport === "softball" ? "Softball" : "Baseball"}
            </div>
            <div className="header-badge">
              {teamSettings.ageGroup || "Age Group"}
            </div>
          </div>
        </div>
      </header>

      <main className="page-content">
        <section className="card controls-card">
          <div className="section-header row-between controls-header">
            <div>
              <div className="section-kicker">Workspace</div>
              <h2>Data Controls</h2>
              <p>Save your team, roster, and games in this browser.</p>
            </div>

            <div className="button-row controls-row">
              <button className="primary-btn" onClick={handleSaveData}>
                Save Data
              </button>
              <button className="danger-btn" onClick={handleResetToSampleData}>
                Reset Sample
              </button>
            </div>
          </div>

          {saveStatus ? <div className="save-status">{saveStatus}</div> : null}
        </section>

        <section className="card">
          <div className="section-header">
            <div className="section-kicker">Setup</div>
            <h2>Team Settings</h2>
            <p>Set the basic team profile and coaching priorities.</p>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="teamName">Team name</label>
              <input
                id="teamName"
                type="text"
                value={teamSettings.teamName}
                onChange={(e) =>
                  handleTeamSettingChange("teamName", e.target.value)
                }
                placeholder="Enter team name"
              />
            </div>

            <div className="field">
              <label htmlFor="ageGroup">Age group</label>
              <input
                id="ageGroup"
                type="text"
                value={teamSettings.ageGroup}
                onChange={(e) =>
                  handleTeamSettingChange("ageGroup", e.target.value)
                }
                placeholder="Example: 10U, 12U, JV"
              />
            </div>

            <div className="field">
              <label htmlFor="sport">Sport</label>
              <select
                id="sport"
                value={teamSettings.sport}
                onChange={(e) =>
                  handleTeamSettingChange("sport", e.target.value)
                }
              >
                <option value="softball">Softball</option>
                <option value="baseball">Baseball</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="teamType">Team type</label>
              <select
                id="teamType"
                value={teamSettings.teamType}
                onChange={(e) =>
                  handleTeamSettingChange("teamType", e.target.value)
                }
              >
                <option value="Rec">Rec</option>
                <option value="Travel">Travel</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="fairnessPriority">Fairness priority</label>
              <select
                id="fairnessPriority"
                value={teamSettings.fairnessPriority}
                onChange={(e) =>
                  handleTeamSettingChange("fairnessPriority", e.target.value)
                }
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="developmentPriority">Development priority</label>
              <select
                id="developmentPriority"
                value={teamSettings.developmentPriority}
                onChange={(e) =>
                  handleTeamSettingChange("developmentPriority", e.target.value)
                }
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="competitivenessPriority">
                Competitiveness priority
              </label>
              <select
                id="competitivenessPriority"
                value={teamSettings.competitivenessPriority}
                onChange={(e) =>
                  handleTeamSettingChange(
                    "competitivenessPriority",
                    e.target.value
                  )
                }
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="section-header row-between">
            <div>
              <div className="section-kicker">Roster</div>
              <h2>Player Roster</h2>
              <p>Add players and define where they can and should play.</p>
            </div>

            <button className="primary-btn" onClick={handleAddPlayer}>
              + Add Player
            </button>
          </div>

          <div className="player-list">
            {players.map((player, index) => (
              <div className="player-card" key={player.id}>
                <div className="player-card-header">
                  <h3>Player {index + 1}</h3>
                  <button
                    className="danger-btn"
                    onClick={() => handleRemovePlayer(player.id)}
                  >
                    Remove
                  </button>
                </div>

                <div className="form-grid">
                  <div className="field">
                    <label>Name</label>
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) =>
                        handlePlayerFieldChange(
                          player.id,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Player name"
                    />
                  </div>

                  <div className="field">
                    <label>Jersey number (optional)</label>
                    <input
                      type="text"
                      value={player.jerseyNumber}
                      onChange={(e) =>
                        handlePlayerFieldChange(
                          player.id,
                          "jerseyNumber",
                          e.target.value
                        )
                      }
                      placeholder="Example: 12"
                    />
                  </div>

                  <div className="field">
                    <label>Role</label>
                    <select
                      value={player.role}
                      onChange={(e) =>
                        handlePlayerFieldChange(
                          player.id,
                          "role",
                          e.target.value
                        )
                      }
                    >
                      <option value="Core Starter">Core Starter</option>
                      <option value="Rotation Player">Rotation Player</option>
                      <option value="Development Player">
                        Development Player
                      </option>
                      <option value="Situational Player">
                        Situational Player
                      </option>
                    </select>
                  </div>
                </div>

                <PositionSelector
                  title="Eligible positions"
                  helpText="Where this player can realistically play."
                  selectedPositions={player.eligiblePositions}
                  onToggle={(position) =>
                    handleTogglePosition(
                      player.id,
                      "eligiblePositions",
                      position
                    )
                  }
                />

                <PositionSelector
                  title="Preferred positions"
                  helpText="Where this player is best or most comfortable."
                  selectedPositions={player.preferredPositions}
                  onToggle={(position) =>
                    handleTogglePosition(
                      player.id,
                      "preferredPositions",
                      position
                    )
                  }
                />

                <PositionSelector
                  title="Emergency-only positions"
                  helpText="Only use here if needed."
                  selectedPositions={player.emergencyOnlyPositions}
                  onToggle={(position) =>
                    handleTogglePosition(
                      player.id,
                      "emergencyOnlyPositions",
                      position
                    )
                  }
                />

                <PositionSelector
                  title="Not-used-there positions"
                  helpText="Positions to avoid for this player."
                  selectedPositions={player.notUsedTherePositions}
                  onToggle={(position) =>
                    handleTogglePosition(
                      player.id,
                      "notUsedTherePositions",
                      position
                    )
                  }
                />

                <div className="field">
                  <label>Notes</label>
                  <textarea
                    rows="3"
                    value={player.notes}
                    onChange={(e) =>
                      handlePlayerFieldChange(
                        player.id,
                        "notes",
                        e.target.value
                      )
                    }
                    placeholder="Anything a coach should remember..."
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="section-header row-between">
            <div>
              <div className="section-kicker">Games</div>
              <h2>Game History</h2>
              <p>View saved games, create a new game, and choose which one to edit.</p>
            </div>

            <button className="primary-btn" onClick={handleCreateNewGame}>
              + New Game
            </button>
          </div>

          {games.length === 0 ? (
            <div className="empty-state">
              <p>No games saved yet. Create a new game to get started.</p>
            </div>
          ) : (
            <div className="game-history-list">
              {games.map((game) => {
                const isSelected = game.id === selectedGameId;

                return (
                  <div
                    key={game.id}
                    className={`game-history-item ${isSelected ? "selected" : ""}`}
                  >
                    <div className="game-history-content">
                      <div className="game-history-main">
                        <h3>{getGameListLabel(game)}</h3>
                        <div className="game-meta">
                          <span className="meta-pill">{game.gameType}</span>
                          <span className="meta-pill">{game.innings} innings</span>
                        </div>
                      </div>

                      <div className="game-history-actions">
                        <button
                          className={`secondary-btn ${isSelected ? "active" : ""}`}
                          onClick={() => setSelectedGameId(game.id)}
                        >
                          {isSelected ? "Selected" : "Edit"}
                        </button>

                        <button
                          className="danger-btn"
                          onClick={() => handleDeleteGame(game.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="card">
          <div className="section-header">
            <div className="section-kicker">Game Day</div>
            <h2>Game Entry</h2>
            <p>Enter game details, lineup, inning-by-inning defense, and bench tracking.</p>
          </div>

          {!selectedGame ? (
            <div className="empty-state">
              <p>Select a game from Game History or create a new one.</p>
            </div>
          ) : (
            <>
              <div className="subsection">
                <h3 className="subsection-title">Basic Game Info</h3>

                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="gameDate">Date</label>
                    <input
                      id="gameDate"
                      type="date"
                      value={selectedGame.date}
                      onChange={(e) => handleGameFieldChange("date", e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="opponent">Opponent</label>
                    <input
                      id="opponent"
                      type="text"
                      value={selectedGame.opponent}
                      onChange={(e) =>
                        handleGameFieldChange("opponent", e.target.value)
                      }
                      placeholder="Enter opponent name"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="gameType">Game type</label>
                    <select
                      id="gameType"
                      value={selectedGame.gameType}
                      onChange={(e) =>
                        handleGameFieldChange("gameType", e.target.value)
                      }
                    >
                      {GAME_TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="innings">Number of innings</label>
                    <select
                      id="innings"
                      value={selectedGame.innings}
                      onChange={(e) => handleInningsChange(e.target.value)}
                    >
                      {INNING_OPTIONS.map((inningCount) => (
                        <option key={inningCount} value={inningCount}>
                          {inningCount}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field top-gap">
                  <label htmlFor="gameNotes">Game notes (optional)</label>
                  <textarea
                    id="gameNotes"
                    rows="3"
                    value={selectedGame.gameNotes}
                    onChange={(e) =>
                      handleGameFieldChange("gameNotes", e.target.value)
                    }
                    placeholder="Anything important about this game..."
                  />
                </div>
              </div>

              <div className="subsection">
                <div className="row-between">
                  <div>
                    <h3 className="subsection-title">Batting Order</h3>
                    <p className="subsection-help">
                      Select players manually into lineup spots.
                    </p>
                  </div>

                  <div className="button-row">
                    <button
                      className="secondary-btn"
                      onClick={handleRemoveBattingSpot}
                    >
                      - Remove Spot
                    </button>
                    <button
                      className="primary-btn"
                      onClick={handleAddBattingSpot}
                    >
                      + Add Spot
                    </button>
                  </div>
                </div>

                <div className="batting-order-list">
                  {selectedGame.battingOrder.map((playerId, index) => (
                    <div className="lineup-row" key={`spot-${index}`}>
                      <div className="lineup-spot-badge">{index + 1}</div>

                      <div className="field lineup-field">
                      
                        <select
                          value={playerId}
                          onChange={(e) =>
                            handleBattingOrderChange(index, e.target.value)
                          }
                        >
                          <option value="">Select player</option>
                          {playerOptions.map((player) => (
                            <option key={player.id} value={player.id}>
                              {player.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="subsection">
                <h3 className="subsection-title">Defensive Positions by Inning</h3>
                <p className="subsection-help">
                  Assign defenders, track bench players, and clearly mark pitcher/catcher each inning.
                </p>

                <div className="inning-list">
                  {selectedGame.inningData.map((inning) => (
                    <div className="inning-card" key={inning.inningNumber}>
                      <div className="inning-card-header">
                        <h3>Inning {inning.inningNumber}</h3>
                      </div>

                      <div className="compact-grid">
                        <div className="field">
                          <label>Pitcher</label>
                          <select
                            value={inning.pitcher}
                            onChange={(e) =>
                              handleBatteryChange(
                                inning.inningNumber,
                                "pitcher",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Select pitcher</option>
                            {playerOptions.map((player) => (
                              <option key={player.id} value={player.id}>
                                {player.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="field">
                          <label>Catcher</label>
                          <select
                            value={inning.catcher}
                            onChange={(e) =>
                              handleBatteryChange(
                                inning.inningNumber,
                                "catcher",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Select catcher</option>
                            {playerOptions.map((player) => (
                              <option key={player.id} value={player.id}>
                                {player.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mini-section">
                        <h4 className="mini-section-title">Defense</h4>

                        <div className="defense-grid">
                          {POSITION_OPTIONS.map((position) => (
                            <div className="field" key={`${inning.inningNumber}-${position}`}>
                              <label>{position}</label>
                              <select
                                value={inning.defense[position]}
                                onChange={(e) =>
                                  handleDefenseChange(
                                    inning.inningNumber,
                                    position,
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">Select player</option>
                                {playerOptions.map((player) => (
                                  <option key={player.id} value={player.id}>
                                    {player.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mini-section">
                        <h4 className="mini-section-title">Bench Tracking</h4>
                        <p className="subsection-help">Select players who sat this inning.</p>

                        <div className="chip-grid">
                          {playerOptions.map((player) => {
                            const isBenched = inning.benchPlayerIds.includes(player.id);

                            return (
                              <button
                                key={`${inning.inningNumber}-bench-${player.id}`}
                                type="button"
                                className={`chip ${isBenched ? "chip-selected" : ""}`}
                                onClick={() =>
                                  handleBenchToggle(inning.inningNumber, player.id)
                                }
                              >
                                {player.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        <section className="card">
          <div className="section-header">
            <div className="section-kicker">Analysis</div>
            <h2>Analysis Summary</h2>
            <p>
              Review simple player usage totals and neutral coaching alerts for the currently selected game.
            </p>
          </div>

          {!selectedGame ? (
            <div className="empty-state">
              <p>Select a game from Game History to see analysis.</p>
            </div>
          ) : (
            <>
              <div className="subsection">
                <h3 className="subsection-title">Alerts</h3>

                {analysisAlerts.length === 0 ? (
                  <div className="alert-card">
                    <p className="alert-text">
                      No simple usage alerts right now. Enter or adjust game data to see analysis.
                    </p>
                  </div>
                ) : (
                  <div className="alerts-list">
                    {analysisAlerts.map((alert, index) => (
                      <div className="alert-card" key={`alert-${index}`}>
                        <p className="alert-text">{alert}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="subsection analysis-table-wrap">
                <h3 className="subsection-title">Player Usage Totals</h3>

                <div className="analysis-table-container">
                  <table className="analysis-table">
                    <thead>
                      <tr>
                        <th>Player</th>
                        <th>Role</th>
                        <th>Bench</th>
                        <th>Infield</th>
                        <th>Outfield</th>
                        <th>Pitcher</th>
                        <th>Catcher</th>
                        <th>Total Defense</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisRows.map((row) => (
                        <tr key={row.playerId}>
                          <td>{row.playerName}</td>
                          <td>{row.role}</td>
                          <td>{row.benchInnings}</td>
                          <td>{row.infieldInnings}</td>
                          <td>{row.outfieldInnings}</td>
                          <td>{row.pitcherInnings}</td>
                          <td>{row.catcherInnings}</td>
                          <td>{row.totalDefensiveInnings}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="analysis-card-list">
                  {analysisRows.map((row) => (
                    <div className="analysis-player-card" key={`card-${row.playerId}`}>
                      <div className="analysis-player-header">
                        <div>
                          <h4>{row.playerName}</h4>
                          <p className="analysis-player-role">{row.role}</p>
                        </div>
                      </div>

                      <div className="stats-grid">
                        <div className="stat-item">
                          <span className="stat-label">Bench</span>
                          <span className="stat-value">{row.benchInnings}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Infield</span>
                          <span className="stat-value">{row.infieldInnings}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Outfield</span>
                          <span className="stat-value">{row.outfieldInnings}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Pitcher</span>
                          <span className="stat-value">{row.pitcherInnings}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Catcher</span>
                          <span className="stat-value">{row.catcherInnings}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Total Defense</span>
                          <span className="stat-value">{row.totalDefensiveInnings}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function PositionSelector({ title, helpText, selectedPositions, onToggle }) {
  return (
    <div className="position-block">
      <div className="position-header">
        <label>{title}</label>
        <span>{helpText}</span>
      </div>

      <div className="chip-grid">
        {POSITION_OPTIONS.map((position) => {
          const isSelected = selectedPositions.includes(position);

          return (
            <button
              key={position}
              type="button"
              className={`chip ${isSelected ? "chip-selected" : ""}`}
              onClick={() => onToggle(position)}
            >
              {position}
            </button>
          );
        })}
      </div>
    </div>
  );
}
