library(tidyverse)
library(httr)

# Retrieve pre-TI statistics
## Why OpenData? Because they have all the relevant statistics
get_fantasy_stats_pre <- function() {
  matches_pre <- read.csv("data/matches_pre.csv", colClasses = "character")
  fantasy_stats_pre <- data.frame(
    match_id = as.character(),
    hero_id = as.character(),
    win = as.logical(),
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
  
  for (match_id in unique(matches_pre$match_id)) {
    response <- GET(paste0("https://api.opendota.com/api/matches/", match_id))
    if (http_status(response)$category != "Success") {
      stop("Unsuccessful request")
    }
    
    for (hero_id in matches_pre[matches_pre$match_id == match_id, ]$hero_id) {
      for (player in content(response)$players) {
        if (player$hero_id == hero_id) {
          fantasy_stats_pre <- fantasy_stats_pre %>%
            add_row(
              match_id = as.character(match_id),
              hero_id = as.character(hero_id),
              win = as.logical(player$win),
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
  
  write.csv(
    fantasy_stats_pre %>%
      inner_join(matches_pre, by = c("match_id", "hero_id")) %>%
      relocate(player_id), 
    "data/fantasy_stats_pre.csv", 
    row.names = FALSE,
    quote = TRUE
  )
}

# Retrieve TI statistics
get_fantasy_stats_ti <- function(update = FALSE) {
  matches_ti <- read.csv("data/matches_ti.csv", colClasses = "character")
  fantasy_stats_ti <- data.frame(
    match_id = as.character(),
    match_time = as.integer(),
    match_duration = as.integer(),
    series_id = as.character(),
    series_type = as.integer(),
    player_id = as.character(),
    hero_id = as.character(),
    win = as.logical(),
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
  
  if (update == TRUE) {
    fantasy_stats_ti <- read.csv(
      "data/fantasy_stats_ti.csv", 
      colClasses = c(
        player_id = "character",
        match_id = "character",
        series_id = "character",
        hero_id = "character"
      )
    )
    matches_ti <- matches_ti %>% anti_join(fantasy_stats_ti, by = "match_id")
  }
  
  for (match_id in matches_ti$match_id) {
    response <- GET(paste0("https://api.opendota.com/api/matches/", match_id))
    if (http_status(response)$category != "Success") {
      warning("Unsuccessful request")
    }
    
    for (player in content(response)$players) {
      fantasy_stats_ti <- fantasy_stats_ti %>%
        add_row(
          match_id = as.character(match_id), 
          match_time = as.integer(content(response)$start_time),
          match_duration = as.integer(content(response)$duration),
          series_id = as.character(content(response)$series_id),
          series_type = as.integer(content(response)$series_type),
          player_id = as.character(player$account_id),
          hero_id = as.character(player$hero_id),
          win = as.logical(player$win),
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
    
    Sys.sleep(1)
  }
  
  write.csv(
    fantasy_stats_ti, 
    "data/fantasy_stats_ti.csv",
    row.names = FALSE,
    quote = TRUE
  )
}
