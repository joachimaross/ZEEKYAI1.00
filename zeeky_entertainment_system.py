"""
🎮 ZEEKY ENTERTAINMENT SYSTEM
Games, stories, music, and interactive entertainment
"""

import asyncio
import json
import logging
import random
from datetime import datetime
from typing import Dict, List, Any, Optional
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GameEngine:
    """Interactive Game Engine"""
    
    def __init__(self):
        self.games = self._initialize_games()
        self.active_sessions = {}
        self.leaderboards = {}
    
    def _initialize_games(self) -> Dict[str, Dict[str, Any]]:
        """Initialize available games"""
        return {
            "trivia": {
                "name": "AI Trivia Challenge",
                "description": "Test your knowledge with AI-generated trivia questions",
                "category": "quiz",
                "difficulty_levels": ["easy", "medium", "hard"],
                "max_players": 4
            },
            "word_game": {
                "name": "Word Association",
                "description": "Creative word association game with AI",
                "category": "word",
                "difficulty_levels": ["beginner", "advanced"],
                "max_players": 2
            },
            "riddle": {
                "name": "Riddle Master",
                "description": "Solve challenging riddles and brain teasers",
                "category": "puzzle",
                "difficulty_levels": ["easy", "medium", "hard", "expert"],
                "max_players": 1
            },
            "story_adventure": {
                "name": "Interactive Story Adventure",
                "description": "Choose your own adventure with AI storytelling",
                "category": "adventure",
                "difficulty_levels": ["casual", "challenging"],
                "max_players": 1
            },
            "math_challenge": {
                "name": "Math Challenge",
                "description": "Quick math problems and puzzles",
                "category": "educational",
                "difficulty_levels": ["basic", "intermediate", "advanced"],
                "max_players": 2
            }
        }
    
    async def get_available_games(self) -> List[Dict[str, Any]]:
        """Get list of available games"""
        return [
            {
                "id": game_id,
                **game_info
            }
            for game_id, game_info in self.games.items()
        ]
    
    async def start_game(self, game_id: str, player_name: str = "Player") -> Dict[str, Any]:
        """Start a new game session"""
        try:
            if game_id not in self.games:
                return {
                    "success": False,
                    "error": "Game not found"
                }
            
            session_id = str(uuid.uuid4())
            game_info = self.games[game_id]
            
            session = {
                "session_id": session_id,
                "game_id": game_id,
                "player_name": player_name,
                "started_at": datetime.now().isoformat(),
                "status": "active",
                "score": 0,
                "level": 1,
                "game_state": self._initialize_game_state(game_id)
            }
            
            self.active_sessions[session_id] = session
            
            return {
                "success": True,
                "session_id": session_id,
                "game_name": game_info["name"],
                "initial_prompt": self._get_initial_prompt(game_id),
                "game_state": session["game_state"]
            }
            
        except Exception as e:
            logger.error(f"Error starting game: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _initialize_game_state(self, game_id: str) -> Dict[str, Any]:
        """Initialize game-specific state"""
        if game_id == "trivia":
            return {
                "current_question": self._generate_trivia_question(),
                "questions_answered": 0,
                "correct_answers": 0
            }
        elif game_id == "word_game":
            return {
                "current_word": "artificial",
                "word_chain": ["artificial"],
                "turn": 1
            }
        elif game_id == "riddle":
            return {
                "current_riddle": self._generate_riddle(),
                "riddles_solved": 0,
                "hints_used": 0
            }
        elif game_id == "story_adventure":
            return {
                "story_chapter": 1,
                "choices_made": [],
                "current_scene": "You find yourself at the entrance of a mysterious castle..."
            }
        elif game_id == "math_challenge":
            return {
                "current_problem": self._generate_math_problem(),
                "problems_solved": 0,
                "streak": 0
            }
        else:
            return {}
    
    def _get_initial_prompt(self, game_id: str) -> str:
        """Get initial game prompt"""
        prompts = {
            "trivia": "Welcome to AI Trivia Challenge! I'll ask you questions and you try to answer correctly. Ready for your first question?",
            "word_game": "Let's play Word Association! I'll start with a word, and you respond with a related word. Then I'll continue the chain.",
            "riddle": "Welcome to Riddle Master! I'll give you riddles to solve. You can ask for hints if you get stuck.",
            "story_adventure": "Welcome to your Interactive Story Adventure! You'll make choices that shape your journey.",
            "math_challenge": "Math Challenge time! I'll give you math problems to solve as quickly as possible."
        }
        return prompts.get(game_id, "Let's play!")
    
    def _generate_trivia_question(self) -> Dict[str, Any]:
        """Generate a trivia question"""
        questions = [
            {
                "question": "What does AI stand for?",
                "options": ["Artificial Intelligence", "Automated Intelligence", "Advanced Intelligence", "Algorithmic Intelligence"],
                "correct": 0,
                "category": "technology"
            },
            {
                "question": "Which programming language is known for its use in AI and machine learning?",
                "options": ["Java", "Python", "C++", "JavaScript"],
                "correct": 1,
                "category": "programming"
            },
            {
                "question": "What year was the first computer bug discovered?",
                "options": ["1945", "1947", "1950", "1952"],
                "correct": 1,
                "category": "history"
            }
        ]
        return random.choice(questions)
    
    def _generate_riddle(self) -> Dict[str, Any]:
        """Generate a riddle"""
        riddles = [
            {
                "riddle": "I speak without a mouth and hear without ears. I have no body, but come alive with wind. What am I?",
                "answer": "echo",
                "hints": ["I repeat what you say", "You might hear me in mountains", "Sound-related phenomenon"]
            },
            {
                "riddle": "The more you take, the more you leave behind. What am I?",
                "answer": "footsteps",
                "hints": ["Think about walking", "You create them as you move", "They show where you've been"]
            },
            {
                "riddle": "I have keys but no locks. I have space but no room. You can enter, but not outside. What am I?",
                "answer": "keyboard",
                "hints": ["Computer-related", "You use me to type", "I have letters and numbers"]
            }
        ]
        return random.choice(riddles)
    
    def _generate_math_problem(self) -> Dict[str, Any]:
        """Generate a math problem"""
        problem_types = ["addition", "subtraction", "multiplication", "division"]
        problem_type = random.choice(problem_types)
        
        if problem_type == "addition":
            a, b = random.randint(10, 100), random.randint(10, 100)
            return {
                "problem": f"{a} + {b} = ?",
                "answer": a + b,
                "type": "addition"
            }
        elif problem_type == "subtraction":
            a, b = random.randint(50, 200), random.randint(10, 50)
            return {
                "problem": f"{a} - {b} = ?",
                "answer": a - b,
                "type": "subtraction"
            }
        elif problem_type == "multiplication":
            a, b = random.randint(5, 15), random.randint(5, 15)
            return {
                "problem": f"{a} × {b} = ?",
                "answer": a * b,
                "type": "multiplication"
            }
        else:  # division
            b = random.randint(5, 12)
            a = b * random.randint(5, 15)
            return {
                "problem": f"{a} ÷ {b} = ?",
                "answer": a // b,
                "type": "division"
            }
    
    async def play_turn(self, session_id: str, player_input: str) -> Dict[str, Any]:
        """Process a player's turn in a game"""
        try:
            session = self.active_sessions.get(session_id)
            if not session:
                return {
                    "success": False,
                    "error": "Game session not found"
                }
            
            game_id = session["game_id"]
            
            if game_id == "trivia":
                return await self._process_trivia_turn(session, player_input)
            elif game_id == "word_game":
                return await self._process_word_game_turn(session, player_input)
            elif game_id == "riddle":
                return await self._process_riddle_turn(session, player_input)
            elif game_id == "story_adventure":
                return await self._process_story_turn(session, player_input)
            elif game_id == "math_challenge":
                return await self._process_math_turn(session, player_input)
            else:
                return {
                    "success": False,
                    "error": "Unknown game type"
                }
                
        except Exception as e:
            logger.error(f"Error processing game turn: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _process_trivia_turn(self, session: Dict[str, Any], answer: str) -> Dict[str, Any]:
        """Process trivia game turn"""
        game_state = session["game_state"]
        current_question = game_state["current_question"]
        
        try:
            answer_index = int(answer) - 1
            correct = answer_index == current_question["correct"]
            
            if correct:
                session["score"] += 10
                game_state["correct_answers"] += 1
                response = "Correct! 🎉"
            else:
                correct_answer = current_question["options"][current_question["correct"]]
                response = f"Incorrect. The correct answer was: {correct_answer}"
            
            game_state["questions_answered"] += 1
            
            # Generate next question
            if game_state["questions_answered"] < 10:
                game_state["current_question"] = self._generate_trivia_question()
                response += f"\n\nNext question: {game_state['current_question']['question']}"
                for i, option in enumerate(game_state['current_question']['options']):
                    response += f"\n{i+1}. {option}"
            else:
                response += f"\n\nGame Over! Final Score: {session['score']}/100"
                session["status"] = "completed"
            
            return {
                "success": True,
                "response": response,
                "score": session["score"],
                "game_over": session["status"] == "completed"
            }
            
        except ValueError:
            return {
                "success": False,
                "error": "Please enter a number (1-4) for your answer"
            }

class StoryGenerator:
    """AI Story Generation System"""
    
    def __init__(self):
        self.story_templates = self._initialize_story_templates()
    
    def _initialize_story_templates(self) -> Dict[str, Dict[str, Any]]:
        """Initialize story templates"""
        return {
            "adventure": {
                "opening": "In a world where {setting}, a {character} discovers {mystery}...",
                "themes": ["courage", "discovery", "friendship", "overcoming obstacles"],
                "settings": ["mystical forest", "ancient castle", "hidden city", "magical realm"]
            },
            "mystery": {
                "opening": "The {character} was called to investigate {mystery} in {setting}...",
                "themes": ["truth", "deception", "justice", "revelation"],
                "settings": ["old mansion", "quiet village", "bustling city", "remote island"]
            },
            "sci-fi": {
                "opening": "In the year {year}, {character} encounters {technology} that changes everything...",
                "themes": ["progress", "humanity", "technology", "exploration"],
                "settings": ["space station", "alien planet", "future city", "research facility"]
            }
        }
    
    async def generate_story(self, genre: str = "adventure", length: str = "short", custom_elements: Optional[Dict] = None) -> Dict[str, Any]:
        """Generate a creative story"""
        try:
            template = self.story_templates.get(genre, self.story_templates["adventure"])
            
            # Generate story elements
            character = self._generate_character()
            setting = random.choice(template["settings"])
            theme = random.choice(template["themes"])
            
            if genre == "sci-fi":
                year = random.randint(2100, 2500)
                technology = random.choice(["AI consciousness", "time travel device", "alien artifact", "quantum computer"])
                mystery = f"a {technology}"
            else:
                mystery = random.choice(["ancient secret", "hidden treasure", "missing person", "strange phenomenon"])
            
            # Generate opening
            opening = template["opening"].format(
                character=character["name"],
                setting=setting,
                mystery=mystery,
                year=year if genre == "sci-fi" else ""
            )
            
            # Generate story based on length
            if length == "short":
                story_parts = [opening, self._generate_middle_short(character, theme), self._generate_ending(theme)]
            else:
                story_parts = [opening, self._generate_middle_long(character, theme), self._generate_climax(character), self._generate_ending(theme)]
            
            story = "\n\n".join(story_parts)
            
            return {
                "success": True,
                "story": story,
                "genre": genre,
                "length": length,
                "character": character,
                "theme": theme,
                "word_count": len(story.split())
            }
            
        except Exception as e:
            logger.error(f"Error generating story: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _generate_character(self) -> Dict[str, Any]:
        """Generate a character"""
        names = ["Alex", "Morgan", "Casey", "Jordan", "Riley", "Sage", "Quinn", "Avery"]
        professions = ["detective", "scientist", "explorer", "artist", "engineer", "teacher", "writer", "inventor"]
        traits = ["brave", "curious", "intelligent", "determined", "creative", "resourceful", "kind", "analytical"]
        
        return {
            "name": random.choice(names),
            "profession": random.choice(professions),
            "trait": random.choice(traits)
        }

    def _generate_middle_short(self, character: Dict[str, Any], theme: str) -> str:
        """Generate short story middle"""
        return f"As {character['name']} the {character['profession']} explored further, their {character['trait']} nature led them to discover the truth about {theme}."

    def _generate_middle_long(self, character: Dict[str, Any], theme: str) -> str:
        """Generate long story middle"""
        return f"The journey was not easy for {character['name']}. As a {character['profession']}, they faced many challenges that tested their {character['trait']} spirit. The theme of {theme} became central to their quest."

    def _generate_climax(self, character: Dict[str, Any]) -> str:
        """Generate story climax"""
        return f"In the final confrontation, {character['name']} had to use all their skills as a {character['profession']} and their {character['trait']} nature to overcome the ultimate challenge."

    def _generate_ending(self, theme: str) -> str:
        """Generate story ending"""
        return f"In the end, the power of {theme} prevailed, and peace was restored to the land. The adventure had changed everyone involved, leaving them wiser and stronger."

class MusicRecommendations:
    """AI Music Recommendation System"""
    
    def __init__(self):
        self.music_database = self._initialize_music_database()
    
    def _initialize_music_database(self) -> Dict[str, List[Dict[str, Any]]]:
        """Initialize music database"""
        return {
            "pop": [
                {"title": "Upbeat Anthem", "artist": "Virtual Band", "mood": "happy", "energy": "high"},
                {"title": "Chill Vibes", "artist": "AI Collective", "mood": "relaxed", "energy": "medium"}
            ],
            "rock": [
                {"title": "Electric Dreams", "artist": "Digital Rock", "mood": "energetic", "energy": "high"},
                {"title": "Acoustic Soul", "artist": "AI Strings", "mood": "contemplative", "energy": "low"}
            ],
            "electronic": [
                {"title": "Synth Wave", "artist": "Cyber Sound", "mood": "focused", "energy": "medium"},
                {"title": "Bass Drop", "artist": "Electronic AI", "mood": "excited", "energy": "high"}
            ],
            "classical": [
                {"title": "Digital Symphony", "artist": "AI Orchestra", "mood": "peaceful", "energy": "low"},
                {"title": "Modern Concerto", "artist": "Virtual Philharmonic", "mood": "inspiring", "energy": "medium"}
            ]
        }
    
    async def get_recommendations(self, mood: str = None, energy: str = None, genre: str = None, activity: str = None) -> Dict[str, Any]:
        """Get music recommendations based on criteria"""
        try:
            recommendations = []
            
            # Filter by criteria
            for genre_name, songs in self.music_database.items():
                if genre and genre_name != genre:
                    continue
                
                for song in songs:
                    if mood and song["mood"] != mood:
                        continue
                    if energy and song["energy"] != energy:
                        continue
                    
                    recommendations.append({
                        **song,
                        "genre": genre_name,
                        "match_score": random.uniform(0.7, 1.0)
                    })
            
            # Sort by match score
            recommendations.sort(key=lambda x: x["match_score"], reverse=True)
            
            return {
                "success": True,
                "recommendations": recommendations[:10],
                "criteria": {
                    "mood": mood,
                    "energy": energy,
                    "genre": genre,
                    "activity": activity
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting music recommendations: {e}")
            return {
                "success": False,
                "error": str(e)
            }

# Global instances
game_engine = GameEngine()
story_generator = StoryGenerator()
music_recommendations = MusicRecommendations()

# Export main components
__all__ = [
    'GameEngine', 'StoryGenerator', 'MusicRecommendations',
    'game_engine', 'story_generator', 'music_recommendations'
]
