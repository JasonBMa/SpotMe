import { useState } from 'react'
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import './App.css'


function App() {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
  const [userAccessToken, setAccessToken] = useState("");
  const navigate = useNavigate();

  const redirectUri = 'http://localhost:5173/SignedIn';
  const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
  }
  
  let codeVerifier = generateRandomString(64);
  console.log("Code Is " + codeVerifier)
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

    const scope = 'user-read-private user-read-email';
    const authUrl = new URL("https://accounts.spotify.com/authorize")
  
    window.localStorage.setItem('code_verifier', codeVerifier);
    console.log(codeVerifier)
    const params =  {
      response_type: 'code',
      client_id: clientId,
      scope,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: redirectUri,
    }
    console.log(redirectUri)
    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();

    const urlParams = new URLSearchParams(window.location.search);
    //getToken(urlParams.get('code'));
    //navigate("/SignedIn", { state: { userAccessToken: userAccessToken }});
  }
  
  return (
    <>
      <h1><span className="title-spot">Spot</span>Me</h1>
      <Button className="spotify-themeify-btn" onClick={logInWithSpotify}>Log In With Spotify</Button>
    </>
  )
}

export default App
