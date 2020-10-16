export interface INormalizedGame {
  Game_Date: string | null;
	Game_Time: string | null;
	Event_Name: string | null;
	Field_Name: string | null;
	Facilities_Description: string | null;
	Division_Name: string | null;
	Pool_Name: string | null;
	Team_Name: string | null;
	Team_Score: number | null;
	Opponent_Team_Name: string | null;
	Opponent_Team_Score:  number | null;
	Team_Outcome: string | null;
	Goal_Differential: string | null;
	Max_Goal_Differential: string | null;
	Trimmed_Goal_Differential: string | null;
	Within_Pool: number | null;
	Outside_Pool: number | null;
	Field_ID: string | null;
	Game_ID: string | null;
	Division_ID: string | null;
	Pool_ID: string | null;
	Team_ID: string | null;
	Opponent_Team_ID: string | null;
	schedule_id: string | null;
	is_active_YN: 0 | 1 | null;
	created_by: string | null;
}