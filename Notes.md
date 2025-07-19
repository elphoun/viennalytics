# Project Goals
## Write a report that details data analysis conducted on a list of moves. Includes interactable graphs and my own personal notes on the data
- Determining if the chess evaluation bar at the beginning can be a reliable metric for determining win/loss percentages
- Global usage stats
- Note on Trends (i.e. Usage By Rating)
    

## Design an opening explorer that allows the user to explore different openings and statistics related to it. 
- Strongest Soldier (Highest Winrate in 2025)
- W/L/D ratio
- Evaluation immediately after being played
- Usage by ELO + Usage by Rating (?)
- Common Moves after Opening
- Average Length of game with opening
- Famous Games (take the top 3) 

# Tech Stack
- Front-End: React, ReactRouter, TailwindCSS, TypeScript
- Back-End: Python (Pandas, D3, Matplot)

# Dataset JSON Template

```python
number_moves_pair: int 
moves: str
opening: str
variation: str
opening_fen: str
opening_eval: float
final_fen: str
white: Player
black: Player
result: "White" or "Black" or "Draw"
```

```python
name: str
elo: int
```