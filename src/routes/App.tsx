import { useState } from 'react'
import { Button} from "react-bootstrap";
import './App.css'


function App() {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
  const [userAccessToken, setAccessToken] = useState("");

  const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
  }
  
  const codeVerifier  = generateRandomString(64);

  const sha256 = async (plain) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return window.crypto.subtle.digest('SHA-256', data)
  }

  const base64encode = (input) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  const hashed = sha256(codeVerifier)
  const codeChallenge = base64encode(hashed);
  // generated in the previous step
  const logInWithSpotify = () => {
    const redirectUri = 'http://localhost:5173';

    const scope = 'user-read-private user-read-email';
    const authUrl = new URL("https://accounts.spotify.com/authorize")
  
    window.localStorage.setItem('code_verifier', codeVerifier);
    const params =  {
      response_type: 'code',
      client_id: clientId,
      scope,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: redirectUri,
    }
  
    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();

    const urlParams = new URLSearchParams(window.location.search);
    getToken(urlParams.get('code'));

  }

  const getToken = async (code) => {

    // stored in the previous step
    let codeVerifier = localStorage.getItem('code_verifier');
  
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    }
  
    const body = await fetch(url, payload);
    const response =await body.json();
  
    localStorage.setItem('access_token', response.access_token);
  }
  
  return (
    <>
      <h1><span className="title-spot">Spot</span>Me</h1>
      <Button className="spotify-themeify-btn"  onClick={logInWithSpotify}>Log In With Spotify</Button>
    </>
  )
}

export default App
