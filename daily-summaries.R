library(tidyverse)
library(rjson)

# Calculate pre-TI and TI summaries
#get_matches_pre()
#get_fantasy_stats_pre()
calculate_fantasy_points_pre()

get_matches_ti()
get_fantasy_stats_ti()
calculate_fantasy_points_ti()

average_pre <- read.csv(
  "data/fantasy_points_pre.csv",
  colClasses = c(
    player_id = "character",
    match_id = "character",
    hero_id = "character"
  )
) %>%
  group_by(player_id) %>%
  summarise(across(.cols = c(-match_id, -hero_id), .fns = mean))
average_ti <- read.csv(
  "data/fantasy_points_ti.csv",
  colClasses = c(
    player_id = "character",
    match_id = "character",
    hero_id = "character"
  )
) %>%
  group_by(player_id) %>%
  summarise(across(.cols = c(-match_id, -hero_id, -match_time), .fns = mean))

avg_best_2 <- function(fantasy_points) {
  sets <- combinations(
    n = length(fantasy_points), 
    r = 3, 
    v = fantasy_points, 
    set = FALSE
  )
  
  best_2 <- c()
  for (row in 1:nrow(sets)) {
    best_2 <- c(best_2, sort(sets[row, ], decreasing = TRUE)[1:2])
  }
  return(mean(best_2))
}
average_ti_best_2 <- read.csv(
  "data/fantasy_points_ti.csv",
  colClasses = c(
    player_id = "character",
    match_id = "character",
    hero_id = "character"
  )
) %>%
  group_by(player_id) %>%
  summarise(best_2 = avg_best_2(total))

# Calculate daily predictions and results
calculate_daily <- function(playing_teams, average_final, start, end) {
  metadata <- read.csv("data/players.csv", colClasses = "character") %>%
    left_join(
      read.csv("data/teams.csv", colClasses = "character"), 
      by = "team_id"
    ) %>%
    select(player_id, player_name, team_name, role, position)
  
  prediction <- metadata %>% 
    inner_join(average_final, by = "player_id") %>%
    select(-(win:stuns)) %>%
    filter(team_name %in% playing_teams) %>%
    arrange(-total)
  prediction_cards <- metadata %>%
    inner_join(calculate_card_bonuses(average_final), by = "player_id") %>%
    select(-(win:stuns)) %>%
    filter(team_name %in% playing_teams) %>%
    arrange(-total)
  
  average_results <- read.csv(
    "data/fantasy_points_ti.csv",
    colClasses = c(
      player_id = "character",
      match_id = "character",
      hero_id = "character"
    )
  ) %>%
    filter(match_time >= start, match_time < end) %>%
    group_by(player_id) %>%
    summarise(across(.cols = win:total, .fns = mean))
  results <- metadata %>%
    inner_join(average_results, by = "player_id") %>%
    filter(team_name %in% playing_teams) %>%
    select(-(win:stuns)) %>%
    arrange(-total)
  results_cards <- metadata %>%
    inner_join(calculate_card_bonuses(average_results), by = "player_id") %>%
    filter(team_name %in% playing_teams) %>%
    select(-(win:stuns)) %>%
    arrange(-total)
  
  return(
    list(
      prediction = prediction, 
      prediction_cards = prediction_cards,
      results = results,
      results_cards = results_cards
    )
  )
}

# Group Stage Day 1
group_d1 <- calculate_daily(
  playing_teams = c(
    "Alliance", 
    "Evil Geniuses",
    "INVICTUS GAMING", 
    "OG",
    "Undying",
    "Virtus.pro"
  ),
  average_final = average_pre,
  start = 1633586400,
  end = 1633586400 + 86400
)

# Group Stage Day 2
group_d2 <- calculate_daily(
  playing_teams = c(
    "Elephant",
    "Fnatic",
    "Quincy Crew",
    "SG esports",
    "Team Secret",
    "Vici Gaming"
  ),
  average_final = average_pre %>%
    left_join(average_ti, by = "player_id", suffix = c("", "_ti")) %>%
    mutate(across(.cols = win:total, .fns = ~.*2/3)) %>%
    mutate(across(.cols = win_ti:total_ti, .fns = ~.*1/3)) %>%
    transmute(
      player_id,
      win = win + win_ti,
      kills = kills + kills_ti,
      deaths = deaths + deaths_ti,
      creep_score = creep_score + creep_score_ti,
      gold_per_min = gold_per_min + gold_per_min_ti,
      tower_kills = tower_kills + tower_kills_ti,
      roshan_kills = roshan_kills + roshan_kills_ti,
      team_fight = team_fight + team_fight_ti,
      obs_wards_planted = obs_wards_planted + obs_wards_planted_ti,
      camps_stacked = camps_stacked + camps_stacked_ti,
      runes_grabbed = runes_grabbed + runes_grabbed_ti,
      first_blood = first_blood + first_blood_ti,
      stuns = stuns + stuns_ti,
      total = total + total_ti
    ),
  start = 1633586400 + 86400,
  end = 1633586400 + (2*86400)
)

# Group Stage Day 3
group_d3 <- calculate_daily(
  playing_teams = c(
    "Alliance",
    "Evil Geniuses",
    "T1",
    "Team Aster",
    "Thunder Predator",
    "Undying"
  ),
  average_final = average_pre %>%
    left_join(average_ti, by = "player_id", suffix = c("", "_ti")) %>%
    mutate(across(.cols = win:total, .fns = ~.*1/3)) %>%
    mutate(across(.cols = win_ti:total_ti, .fns = ~.*2/3)) %>%
    transmute(
      player_id,
      win = win + win_ti,
      kills = kills + kills_ti,
      deaths = deaths + deaths_ti,
      creep_score = creep_score + creep_score_ti,
      gold_per_min = gold_per_min + gold_per_min_ti,
      tower_kills = tower_kills + tower_kills_ti,
      roshan_kills = roshan_kills + roshan_kills_ti,
      team_fight = team_fight + team_fight_ti,
      obs_wards_planted = obs_wards_planted + obs_wards_planted_ti,
      camps_stacked = camps_stacked + camps_stacked_ti,
      runes_grabbed = runes_grabbed + runes_grabbed_ti,
      first_blood = first_blood + first_blood_ti,
      stuns = stuns + stuns_ti,
      total = total + total_ti
    ),
  start = 1633586400 + (2*86400),
  end = 1633586400 + (3*86400)
)

# Group Stage Day 4
group_d4 <- calculate_daily(
  playing_teams = c(
    "beastcoast",
    "Elephant",
    "PSG.LGD",
    "Quincy Crew",
    "SG esports",
    "Team Secret",
    "Team Spirit"
  ),
  average_final = average_ti,
  start = 1633586400 + (3*86400),
  end = 1633586400 + (4*86400)
)

# Main Stage Day 1
main_d1 <- calculate_daily(
  playing_teams = c(
    "INVICTUS GAMING",
    "OG",
    "Team Secret",
    "Team Spirit"
  ),
  average_final = average_ti,
  start = 1633586400 + (5*86400),
  end = 1633586400 + (6*86400)
)
