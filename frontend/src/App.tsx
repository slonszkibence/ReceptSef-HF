import { useState, useEffect } from 'react';
import './App.css';

// ADATÍPUSOK
interface Recipe {
  id?: number;
  title: string;
  time: string;
  ingredients: string[] | string;
  steps: string[] | string;
}

interface ShoppingItem {
  id: number;
  item_name: string;
  is_purchased: boolean;
}

function App() {
  // --- AUTH STATE ---
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  // --- APP STATE ---
  const [view, setView] = useState<'generator' | 'favorites' | 'shopping'>('generator');
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]); // ÚJ: Bevásárlólista

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
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      const body = isRegistering ? JSON.stringify({ username, password }) : formData;
      const headers: any = {};
      if (isRegistering) headers['Content-Type'] = 'application/json';
      
      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      if (!response.ok) throw new Error(isRegistering ? 'Sikertelen regisztráció' : 'Hibás belépés');

      if (isRegistering) {
        setAuthMessage('Sikeres regisztráció! Most lépj be.');
        setIsRegistering(false);
      } else {
        const data = await response.json();
        setToken(data.access_token);
        localStorage.setItem('token', data.access_token);
        setUsername(''); setPassword('');
      }
    } catch (err: any) { setAuthMessage(err.message); }
  };

  const logout = () => {
    setToken(null); localStorage.removeItem('token'); setRecipe(null); setView('generator');
  };

  // --- DATA LOADING FÜGGVÉNYEK ---
  const loadFavorites = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/recipes', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        const processedRecipes = data.map((r: any) => ({
          ...r,
          ingredients: typeof r.ingredients === 'string' ? JSON.parse(r.ingredients) : r.ingredients,
          steps: typeof r.instructions === 'string' ? r.instructions.split('\n') : r.instructions
        }));
        setFavorites(processedRecipes);
        setView('favorites');
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  // ÚJ: Bevásárlólista betöltése
  const loadShoppingList = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/shopping-list', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setShoppingList(data);
        setView('shopping');
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  // ÚJ: Hozzáadás bevásárlólistához
  const addToShoppingList = async (item: string) => {
    if (!token) return;
    try {
      const response = await fetch('http://127.0.0.1:8000/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ item_name: item }),
      });
      if (response.ok) {
        alert(`"${item}" hozzáadva a listához!`);
      }
    } catch (err) { console.error(err); }
  };

  // ÚJ: Törlés bevásárlólistáról
  const deleteShoppingItem = async (id: number) => {
    if (!token) return;
    try {
      await fetch(`http://127.0.0.1:8000/shopping-list/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setShoppingList(prev => prev.filter(item => item.id !== id));
    } catch (err) { console.error(err); }
  };

  // ÚJ: Pipálás (Statusz váltás)
  const toggleShoppingItem = async (id: number) => {
    if (!token) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/shopping-list/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        // Frissítjük a helyi state-et is
        setShoppingList(prev => prev.map(item => 
          item.id === id ? { ...item, is_purchased: !item.is_purchased } : item
        ));
      }
    } catch (err) { console.error(err); }
  };

  // --- APP FÜGGVÉNYEK ---
  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setLoading(true); setError(''); setRecipe(null); setSaveStatus('');
    try {
      const response = await fetch('http://127.0.0.1:8000/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: inputText.split(',') }),
      });
      if (!response.ok) throw new Error('Hiba generáláskor');
      
      const data = await response.json();
      const recipeData = JSON.parse(data.recipe_json);

      // --- ÚJ RÉSZ: Ellenőrizzük, hogy talált-e receptet ---
      if (recipeData.title === "Nincs találat" || recipeData.ingredients.length === 0) {
        // Nem hiba, de nem is recept -> Üzenet a felhasználónak
        setError('Sajnos ezekből nem tudtam receptet kitalálni. Próbálj megadni más hozzávalókat!');
      } else {
        // Minden rendben, van recept
        setRecipe(recipeData);
      }
      // -----------------------------------------------------

    } catch (err) { 
      console.error(err);
      setError('Technikai hiba történt a generálás során.'); // Ez marad a valódi hibákra
    } finally { 
      setLoading(false); 
    }
  };

  const handleSave = async () => {
    if (!recipe || !token) return;
    try {
      const response = await fetch('http://127.0.0.1:8000/save-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(recipe),
      });
      if (response.ok) setSaveStatus('Sikeresen mentve! ✅');
      else setSaveStatus('Hiba a mentéskor ❌');
    } catch (err) { setSaveStatus('Szerver hiba ❌'); }
  };

  if (!token) {
    return (
      <div className="container">
        <h1>🔐 ReceptSéf Belépés</h1>
        <div className="input-group" style={{flexDirection: 'column', alignItems: 'center'}}>
          <input placeholder="Felhasználónév" value={username} onChange={e => setUsername(e.target.value)} />
          <input type="password" placeholder="Jelszó" value={password} onChange={e => setPassword(e.target.value)} style={{marginTop: 10}} />
          <button onClick={handleAuth} style={{marginTop: 10}}>{isRegistering ? 'Regisztráció' : 'Belépés'}</button>
          <p style={{marginTop: 20, cursor: 'pointer', textDecoration: 'underline'}} onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Már van fiókod? Lépj be!' : 'Nincs fiókod? Regisztrálj!'}
          </p>
          {authMessage && <p style={{color: isRegistering && !authMessage.includes('Siker') ? 'red' : 'blue'}}>{authMessage}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #eee', paddingBottom: 10}}>
        <h2 style={{margin:0}}>👨‍🍳 ReceptSéf</h2>
        <div style={{display: 'flex', gap: 10}}>
          <button onClick={() => setView('generator')} style={{background: view==='generator'?'#42b883':'#ddd'}}>Generáló</button>
          <button onClick={loadFavorites} style={{background: view==='favorites'?'#f1c40f':'#ddd'}}>Kedvencek</button>
          <button onClick={loadShoppingList} style={{background: view==='shopping'?'#3498db':'#ddd'}}>Bevásárlólista</button>
          <button onClick={logout} style={{background: '#e74c3c'}}>Kilépés</button>
        </div>
      </div>

      {/* --- GENERÁLÓ NÉZET --- */}
      {view === 'generator' && (
        <>
          <p>Írd be, mi van otthon (pl: tojás, liszt, tej), és én kitalálok valamit!</p>
          <div className="input-group">
            <input type="text" placeholder="Hozzávalók..." value={inputText} onChange={(e) => setInputText(e.target.value)} />
            <button onClick={handleGenerate} disabled={loading}>{loading ? 'Séf gondolkodik...' : 'Recept Kérése'}</button>
          </div>
          {error && <div className="error">{error}</div>}
          
          {recipe && (
            <div className="recipe-card">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h2>{recipe.title}</h2>
                <button onClick={handleSave} className="save-button" disabled={saveStatus === 'Sikeresen mentve! ✅'}>{saveStatus || '❤️ Mentés'}</button>
              </div>
              <p><strong>⏱️ Idő:</strong> {recipe.time}</p>
              <h3>🛒 Hozzávalók (A "+" jellel a listához adhatod):</h3>
              <ul className="shopping-list">
                {(recipe.ingredients as string[]).map((i, x) => (
                  <li key={x} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span>{i}</span>
                    <button 
                      onClick={() => addToShoppingList(i)} 
                      style={{padding:'2px 8px', fontSize:'12px', background:'#3498db', marginLeft: 10}}
                    >+ Lista</button>
                  </li>
                ))}
              </ul>
              <h3>🍳 Elkészítés:</h3>
              <ol>{(recipe.steps as string[]).map((s, x) => <li key={x}>{s}</li>)}</ol>
            </div>
          )}
        </>
      )}

      {/* --- KEDVENCEK NÉZET --- */}
      {view === 'favorites' && (
        <div>
          <h2>⭐ Mentett Receptjeim</h2>
          {loading && <p>Betöltés...</p>}
          {favorites.length === 0 && !loading && <p>Még nincs mentett recepted.</p>}
          <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
            {favorites.map((fav) => (
              <div key={fav.id} className="recipe-card" style={{marginTop: 0}}>
                <h3>{fav.title}</h3>
                <p><strong>⏱️ {fav.time}</strong></p>
                <details>
                  <summary style={{cursor: 'pointer', color: '#42b883', fontWeight: 'bold'}}>Részletek</summary>
                  <div style={{marginTop: 10}}>
                    <h4>Hozzávalók:</h4>
                    <ul>
                      {(fav.ingredients as string[]).map((ing, idx) => (
                        <li key={idx} style={{display:'flex', justifyContent:'space-between'}}>
                           {ing}
                           <button onClick={() => addToShoppingList(ing)} style={{padding:'2px 8px', fontSize:'10px', background:'#3498db'}}>+ Lista</button>
                        </li>
                      ))}
                    </ul>
                    <h4>Elkészítés:</h4>
                    <ol>{(fav.steps as string[]).map((step, idx) => <li key={idx}>{step}</li>)}</ol>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- BEVÁSÁRLÓLISTA NÉZET (ÚJ) --- */}
      {view === 'shopping' && (
        <div>
          <h2>🛒 Bevásárlólista</h2>
          {loading && <p>Betöltés...</p>}
          {shoppingList.length === 0 && !loading && <p>A lista üres.</p>}
          <ul className="shopping-list-view" style={{listStyle:'none', padding:0}}>
            {shoppingList.map((item) => (
              <li key={item.id} style={{
                  background: item.is_purchased ? '#f0f0f0' : 'white', // Szürke ha kész
                  padding:10, margin:'10px 0', borderRadius:5, 
                  display:'flex', justifyContent:'space-between', alignItems:'center', 
                  boxShadow:'0 2px 4px rgba(0,0,0,0.1)',
                  opacity: item.is_purchased ? 0.6 : 1 // Halványabb ha kész
                }}>
                
                <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                  {/* CHECKBOX A PIPÁLÁSHOZ */}
                  <input 
                    type="checkbox" 
                    checked={item.is_purchased} 
                    onChange={() => toggleShoppingItem(item.id)}
                    style={{width: 20, height: 20, cursor: 'pointer'}}
                  />
                  <span style={{
                    fontSize:18, 
                    textDecoration: item.is_purchased ? 'line-through' : 'none'
                  }}>
                    {item.item_name}
                  </span>
                </div>

                <button onClick={() => deleteShoppingItem(item.id)} style={{background:'#e74c3c', padding:'5px 10px'}}>Törlés</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;