library(tidyverse)

# Calculate pre-TI fantasy points
calculate_fantasy_points_pre <- function() {
  fantasy_stats <- read.csv(
    "data/fantasy_stats_pre.csv", 
    colClasses = c(
      player_id = "character",
      match_id = "character",
      hero_id = "character"
    )
  )
  
  fantasy_points <- fantasy_stats %>%
    transmute(
      player_id,
      match_id,
      hero_id,
      win,
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
    "data/fantasy_points_pre.csv",
    row.names = FALSE, 
    quote = TRUE
  )
}

# Calculate TI fantasy points
calculate_fantasy_points_ti <- function() {
  fantasy_stats <- read.csv(
    "data/fantasy_stats_ti.csv", 
    colClasses = c(
      player_id = "character",
      match_id = "character",
      hero_id = "character"
    )
  )
  
  fantasy_points <- fantasy_stats %>%
    transmute(
      player_id,
      match_id,
      match_time,
      match_duration,
      series_id,
      series_type,
      hero_id,
      win,
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
    "data/fantasy_points_ti.csv",
    row.names = FALSE, 
    quote = TRUE
  )
}