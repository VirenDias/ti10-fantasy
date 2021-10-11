library(tidyverse)
library(httr)

# Retrieve pre-TI matches 
## Why DatDota? Because they manually assign games on smurfs to main accounts
get_matches_pre <- function() {
  players <- read.csv("data/players.csv", colClasses = "character")
  matches_pre <- data.frame(
    match_id = as.character(), 
    hero_id = as.character(), 
    player_id = as.character()
  )
  
  for (player_id in players$player_id) {
    response <- GET(
      "https://datdota.com/api/players/single-performance",
      query = list(
        players = player_id,
        patch = "7.29,7.30",
        tier = "1,2",
        "valve-event" = "does-not-matter"
      )
    )
    if (http_status(response)$category != "Success") {
      warning("Unsuccessful request")
    }
    
    for (match in content(response)$data) {
      matches_pre <- matches_pre %>% 
        add_row(
          match_id = as.character(match$matchId),
          hero_id = as.character(match$hero),
          player_id = as.character(player_id)
        )
    }
  }
  
  write.csv(
    matches_pre, 
    "data/matches_pre.csv", 
    row.names = FALSE, 
    quote = TRUE
  )
}

# Retrieve TI matches
get_matches_ti <- function() {
  matches_ti <- data.frame(match_id = as.character())
  
  response <- GET(paste0("https://api.opendota.com/api/leagues/13256/matches"))
  if (http_status(response)$category != "Success") {
    stop("Unsuccessful request")
  }
  for (match in content(response)) {
    if (match$start_time >= 1633586400) {
      matches_ti <- matches_ti %>% 
        add_row(match_id = as.character(match$match_id))
    }
  }
  
  write.csv(matches_ti, "data/matches_ti.csv", row.names = FALSE, quote = TRUE)
}
