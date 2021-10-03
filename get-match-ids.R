library(tidyverse)
library(httr)

# Read in player information
players <- read.csv("data/players.csv", colClasses = "character")

# Create an empty dataframe to store the match data
matches <- data.frame(
  match_id = as.character(), 
  hero_id = as.character(), 
  player_id = as.character()
)

# Retrieve match IDs for patches 7.29 and 7.30 from DatDota
## Why DatDota? Because they manually assign games on smurfs to main accounts
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
    stop("Unsuccessful request")
  }
  
  for (match in content(response)$data) {
    matches <- matches %>% 
      add_row(
        match_id = as.character(match$matchId),
        hero_id = as.character(match$hero),
        player_id = as.character(player_id)
      )
  }
}

rm(player_id, match, response)
write.csv(matches, "data/matches.csv", row.names = FALSE, quote = TRUE)
