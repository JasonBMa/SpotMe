//import { useState } from 'react'
import { Container, Row, Button } from "react-bootstrap";
//import { useNavigate } from "react-router-dom";
import './App.css'


const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  //const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

const redirectUri = 'http://localhost:5173/SignedIn';

function generateCodeVerifier(length: number) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
}

const logInWithSpotify = async () => {
  let codeVerifier = generateCodeVerifier(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);;
  window.localStorage.setItem('code_verifier', codeVerifier);

  const scope = 'user-read-private user-read-email';
  const authUrl = new URL("https://accounts.spotify.com/authorize")

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
}

function App() {
  return (
    <>
      <Container
        style={{
          width: "100vw",
          display: "flex",
          justifyContent: "center"
        }}
      >
        <Row
          style={{
            justifyContent: "around"
          }}
        >
          <h1><span className="title-spot">Spot</span>Me</h1>
          <Button className="spotify-themeify-btn" onClick={logInWithSpotify}>Log In With Spotify</Button>
          
        </Row>
      </Container>
    </>
  )
}

export default App
