library(tidyverse)
library(httr)

# Read in match information
matches <- read.csv("data/matches.csv", colClasses = "character")

# Create an empty dataframe to store the fantasy-related statistics
fantasy_stats <- data.frame(
  match_id = as.character(), 
  hero_id = as.character(),
  kills = as.integer(),
  deaths = as.integer(),
  creep_score = as.integer(),
  gold_per_min = as.integer(),
  tower_kills = as.integer(),
  roshan_kills = as.integer(),
  team_fight = as.double(),
  obs_wards_planted = as.integer(),
  camps_stacked = as.integer(),
  runes_grabbed = as.integer(),
  first_blood = as.integer(),
  stuns = as.double()
)

# Retrieve match data from OpenDota to mine for fantasy-point-related statistics
## Why OpenData? Because they have all the relevant statistics
for (match_id in unique(matches$match_id)) {
  response <- GET(paste0("https://api.opendota.com/api/matches/", match_id))
  if (http_status(response)$category != "Success") {
    stop("Unsuccessful request")
  }
  
  for (hero_id in matches[matches$match_id == match_id, ]$hero_id) {
    for (player in content(response)$players) {
      if (player$hero_id == hero_id) {
        fantasy_stats <- fantasy_stats %>%
          add_row(
            match_id = as.character(match_id), 
            hero_id = as.character(hero_id),
            kills = as.integer(player$kills),
            deaths = as.integer(player$deaths),
            creep_score = as.integer(player$last_hits + player$denies),
            gold_per_min = as.integer(player$gold_per_min),
            tower_kills = as.integer(player$towers_killed),
            roshan_kills = as.integer(player$roshans_killed),
            team_fight = as.double(player$teamfight_participation),
            obs_wards_planted = as.integer(player$obs_placed),
            camps_stacked = as.integer(player$camps_stacked),
            runes_grabbed = as.integer(player$rune_pickups),
            first_blood = as.integer(player$firstblood_claimed),
            stuns = as.double(player$stuns)
          )
      }
    }
  }
  
  Sys.sleep(1)
}

rm(match_id, hero_id, player, response)
write.csv(
  fantasy_stats %>%
    inner_join(matches, by = c("match_id", "hero_id")) %>%
    relocate(player_id), 
  "data/fantasy_stats_pre_ti.csv", 
  row.names = FALSE,
  quote = TRUE
)
