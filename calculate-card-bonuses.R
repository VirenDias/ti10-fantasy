library(tidyverse)
library(rjson)

calculate_card_bonuses <- function(fantasy_summary) {
  # Read in the card and fantasy data
  cards_json <- fromJSON(file = "data/cards.json")$cards
  
  # Create an empty dataframe to store the card bonuses
  cards <- data.frame(
    player_id = as.character(),
    kills = as.integer(),
    deaths = as.integer(),
    creep_score = as.integer(),
    gold_per_min = as.integer(),
    tower_kills = as.integer(),
    roshan_kills = as.integer(),
    team_fight = as.integer(),
    obs_wards_planted = as.integer(),
    camps_stacked = as.integer(),
    runes_grabbed = as.integer(),
    first_blood = as.integer(),
    stuns = as.integer()
  )
  
  # Retrieve the bonuses per card
  for (card in cards_json) {
    row <- list(
      player_id = as.character(card$player_account_id),
      kills = 0,
      deaths = 0,
      creep_score = 0,
      gold_per_min = 0,
      tower_kills = 0,
      roshan_kills = 0,
      team_fight = 0,
      obs_wards_planted = 0,
      camps_stacked = 0,
      runes_grabbed = 0,
      first_blood = 0,
      stuns = 0
    )
    for (bonus in card$bonuses) {
      if ( bonus$bonus_stat == 0) {
        row$kills = bonus$bonus_value
      } else if (bonus$bonus_stat == 1) {
        row$deaths = bonus$bonus_value
      } else if (bonus$bonus_stat == 2) {
        row$creep_score = bonus$bonus_value
      } else if (bonus$bonus_stat == 3) {
        row$gold_per_min = bonus$bonus_value
      } else if (bonus$bonus_stat == 4) {
        row$tower_kills = bonus$bonus_value
      } else if (bonus$bonus_stat == 5) {
        row$roshan_kills = bonus$bonus_value
      } else if (bonus$bonus_stat == 6) {
        row$team_fight = bonus$bonus_value
      } else if (bonus$bonus_stat == 7) {
        row$obs_wards_planted = bonus$bonus_value
      } else if (bonus$bonus_stat == 8) {
        row$camps_stacked = bonus$bonus_value
      } else if (bonus$bonus_stat == 9) {
        row$runes_grabbed = bonus$bonus_value
      } else if (bonus$bonus_stat == 10) {
        row$first_blood = bonus$bonus_value
      } else if (bonus$bonus_stat == 11) {
        row$stuns = bonus$bonus_value
      }
    }
    cards <- rbind(cards, row)
  }
  
  # Calculate the total fantasy points per card with bonuses
  card_summary <- fantasy_summary %>%
    right_join(cards, by = "player_id", suffix = c("", "_bonus")) %>%
    mutate(across(ends_with("_bonus"), .fns = ~1 + ./100)) %>%
    mutate(
      kills = kills*kills_bonus,
      # deaths = 3 - (3-deaths)*(2-deaths_bonus),
      deaths = deaths*deaths_bonus,
      creep_score = creep_score*creep_score_bonus,
      gold_per_min = gold_per_min*gold_per_min_bonus,
      tower_kills = tower_kills*tower_kills_bonus,
      roshan_kills = roshan_kills*roshan_kills_bonus,
      team_fight = team_fight*team_fight_bonus,
      obs_wards_planted = obs_wards_planted*obs_wards_planted_bonus,
      camps_stacked = camps_stacked*camps_stacked_bonus,
      runes_grabbed = runes_grabbed*runes_grabbed_bonus,
      first_blood = first_blood*first_blood_bonus,
      stuns = stuns*stuns_bonus,
      total = kills + deaths + creep_score + gold_per_min + tower_kills + 
        roshan_kills + team_fight + obs_wards_planted + camps_stacked +
        runes_grabbed + first_blood + stuns
    ) %>%
    select(-(kills:stuns)) %>%
    mutate(across(ends_with("_bonus"), .fns = ~.*100 - 100)) %>%
    mutate(across(ends_with("_bonus"), .fns = ~ifelse(. == 0, NA, .))) %>%
    rename_with(.fn = ~gsub("_bonus", "", .), .cols = ends_with("_bonus")) %>%
    relocate(total, .after = last_col())
  
  return(card_summary)
}