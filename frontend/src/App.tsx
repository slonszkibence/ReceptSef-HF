import { useState } from 'react';
import './App.css';

interface Recipe {
  title: string;
  time: string;
  ingredients: string[];
  steps: string[];
}

function App() {
  // --- AUTH STATE ---
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  // --- APP STATE ---
  const [inputText, setInputText] = useState('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  // --- AUTH FÜGGVÉNYEK ---
  const handleAuth = async () => {
    setAuthMessage('');
    const endpoint = isRegistering ? '/register' : '/token';
    
    try {
      const formData = new URLSearchParams(); // A FastAPI token végpont form-data-t vár
      formData.append('username', username);
      formData.append('password', password);

      const body = isRegistering 
        ? JSON.stringify({ username, password }) 
        : formData;

      const headers: any = {};
      if (isRegistering) headers['Content-Type'] = 'application/json';
      
      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      if (!response.ok) throw new Error(isRegistering ? 'Sikertelen regisztráció (foglalt név?)' : 'Hibás belépés');

      if (isRegistering) {
        setAuthMessage('Sikeres regisztráció! Most lépj be.');
        setIsRegistering(false);
      } else {
        const data = await response.json();
        const accessToken = data.access_token;
        setToken(accessToken);
        localStorage.setItem('token', accessToken); // Token mentése
        setUsername('');
        setPassword('');
      }
    } catch (err: any) {
      setAuthMessage(err.message);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setRecipe(null);
  };

  // --- APP FÜGGVÉNYEK ---
  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError('');
    setRecipe(null);
    setSaveStatus('');

    try {
      const response = await fetch('http://127.0.0.1:8000/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: inputText.split(',') }),
      });
      if (!response.ok) throw new Error('Hiba generáláskor');
      const data = await response.json();
      setRecipe(JSON.parse(data.recipe_json));
    } catch (err) {
      setError('Hiba történt a generálás során.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!recipe || !token) return;
    try {
      const response = await fetch('http://127.0.0.1:8000/save-recipe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // <--- ITT KÜLDJÜK A TOKENT!
        },
        body: JSON.stringify(recipe),
      });
      if (response.ok) setSaveStatus('Sikeresen mentve! ✅');
      else setSaveStatus('Hiba a mentéskor ❌');
    } catch (err) {
      setSaveStatus('Szerver hiba ❌');
    }
  };

  // --- HA NINCS BELÉPVE, MUTASD A LOGIN KÉPERNYŐT ---
  if (!token) {
    return (
      <div className="container">
        <h1>🔐 ReceptSéf Belépés</h1>
        <div className="input-group" style={{flexDirection: 'column', alignItems: 'center'}}>
          <input placeholder="Felhasználónév" value={username} onChange={e => setUsername(e.target.value)} />
          <input type="password" placeholder="Jelszó" value={password} onChange={e => setPassword(e.target.value)} style={{marginTop: 10}} />
          <button onClick={handleAuth} style={{marginTop: 10}}>
            {isRegistering ? 'Regisztráció' : 'Belépés'}
          </button>
          
          <p style={{marginTop: 20, cursor: 'pointer', textDecoration: 'underline'}} onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Már van fiókod? Lépj be!' : 'Nincs fiókod? Regisztrálj!'}
          </p>
          {authMessage && <p style={{color: isRegistering && !authMessage.includes('Siker') ? 'red' : 'blue'}}>{authMessage}</p>}
        </div>
      </div>
    );
  }

  // --- HA BE VAN LÉPVE, MUTASD AZ ALKALMAZÁST ---
  return (
    <div className="container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1>👨‍🍳 ReceptSéf MI</h1>
        <button onClick={logout} style={{background: '#e74c3c', fontSize: '12px'}}>Kijelentkezés</button>
      </div>
      
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
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h2>{recipe.title}</h2>
            <button onClick={handleSave} className="save-button" disabled={saveStatus === 'Sikeresen mentve! ✅'}>
              {saveStatus || '❤️ Mentés'}
            </button>
          </div>
          <p><strong>⏱️ Idő:</strong> {recipe.time}</p>
          <h3>🛒 Hozzávalók:</h3>
          <ul>{recipe.ingredients.map((i, x) => <li key={x}>{i}</li>)}</ul>
          <h3>🍳 Elkészítés:</h3>
          <ol>{recipe.steps.map((s, x) => <li key={x}>{s}</li>)}</ol>
        </div>
      )}
    </div>
  );
}

export default App;