import { useState } from 'react';
import './App.css';

// Adattípus a recepthez (TypeScript előnye!)
interface Recipe {
  title: string;
  time: string;
  ingredients: string[];
  steps: string[];
}

function App() {
  const [inputText, setInputText] = useState('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setError('');
    setRecipe(null);

    // A beírt szöveget vesszők mentén szétszedjük tömbre
    const ingredientsList = inputText.split(',').map(item => item.trim());

    try {
      // Itt hívjuk meg a Python Backendünket
      const response = await fetch('http://127.0.0.1:8000/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: ingredientsList }),
      });

      if (!response.ok) {
        throw new Error('Hiba a szerver kommunikációban');
      }

      const data = await response.json();
      // A backend szövegként küldi a JSON-t, itt parse-oljuk objektummá
      const recipeData = JSON.parse(data.recipe_json);

      console.log("MI VÁLASZA:", recipeData);

      setRecipe(recipeData);

    } catch (err) {
      console.error(err);
      setError('Nem sikerült receptet generálni. Fut a backend?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>👨‍🍳 ReceptSéf MI</h1>
      <p>Írd be, mi van otthon (pl: tojás, liszt, tej), és én kitalálok valamit!</p>

      <div className="input-group">
        <input
          type="text"
          placeholder="Hozzávalók vesszővel elválasztva..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Séf gondolkodik...' : 'Recept Kérése'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {recipe && (
        <div className="recipe-card">
          <h2>{recipe.title}</h2>
          <p><strong>⏱️ Elkészítési idő:</strong> {recipe.time}</p>
          
          <h3>🛒 Hozzávalók:</h3>
          <ul>
            {recipe.ingredients.map((ing, index) => (
              <li key={index}>{ing}</li>
            ))}
          </ul>

          <h3>🍳 Elkészítés:</h3>
          <ol>
            {recipe.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default App;