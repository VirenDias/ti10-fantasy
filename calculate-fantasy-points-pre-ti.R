library(tidyverse)

# Read in player, team, and fantasy information
players <- read.csv("data/players.csv", colClasses = "character")
teams <- read.csv("data/teams.csv", colClasses = "character")
fantasy_stats <- read.csv(
  "data/fantasy_stats_pre_ti.csv", 
  colClasses = c(
    player_id = "character",
    match_id = "character",
    hero_id = "character"
  )
)

# Calculate the fantasy points per match
fantasy_points <- fantasy_stats %>%
  transmute(
    player_id,
    match_id,
    hero_id,
    kills = kills*0.3,
    deaths = 3 - deaths*0.3,
    creep_score = creep_score*0.003,
    gold_per_min = gold_per_min*0.002,
    tower_kills,
    roshan_kills,
    team_fight = team_fight*3,
    obs_wards_planted = obs_wards_planted*0.5,
    camps_stacked = camps_stacked*0.5,
    runes_grabbed = runes_grabbed*0.25,
    first_blood = first_blood*4,
    stuns = stuns*0.05,
    total = kills + deaths + creep_score + gold_per_min + tower_kills + 
      roshan_kills + team_fight + obs_wards_planted + camps_stacked +
      runes_grabbed + first_blood + stuns
  )

write.csv(
  fantasy_points, 
  "data/fantasy_points_pre_ti.csv",
  row.names = FALSE, 
  quote = TRUE
)

# Calculate the summary statistics per player
fantasy_summary <- fantasy_points %>%
  group_by(player_id) %>%
  summarise(across(.cols = c(-match_id, -hero_id), .fns = mean)) %>%
  left_join(players, by = "player_id") %>%
  left_join(teams, by = "team_id") %>%
  select(player_name, team_name, role, position, kills:total)

write.csv(
  fantasy_summary, 
  "data/fantasy_summary_pre_ti.csv",
  row.names = FALSE, 
  quote = TRUE
)
